import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export async function getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, status, priority, dueDate, order } = req.body;

    // Get max order for new task
    const maxOrder = await prisma.task.aggregate({
      where: { userId: req.userId },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        userId: req.userId!,
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Authorization: ensure task belongs to user
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) throw createError('Task not found', 404);

    const { title, description, status, priority, dueDate, order } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(order !== undefined && { order }),
      },
    });
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Authorization: ensure task belongs to user
    const existing = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) throw createError('Task not found', 404);

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reorderTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Novelty feature: bulk reorder
    const { orderedIds } = req.body as { orderedIds: string[] };
    if (!Array.isArray(orderedIds)) {
      throw createError('orderedIds must be an array', 400);
    }

    // Verify all tasks belong to user
    const tasks = await prisma.task.findMany({
      where: { id: { in: orderedIds }, userId: req.userId },
      select: { id: true },
    });

    if (tasks.length !== orderedIds.length) {
      throw createError('One or more tasks not found', 404);
    }

    // Bulk update orders in transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.task.update({ where: { id }, data: { order: index } })
      )
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
