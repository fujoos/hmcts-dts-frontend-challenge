import {
  Task,
  TaskRequest,
  TaskStatus,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../services/taskApi';

import { Application } from 'express';


function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoFromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

function formatDueDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: TaskStatus): string {
  if (status === 'IN_PROGRESS') return 'In progress';
  if (status === 'DONE') return 'Done';
  return 'To do';
}

function validateTaskForm(body: any): { values: any; errors: { field: string; message: string }[] } {
  const errors: { field: string; message: string }[] = [];

  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const status = String(body.status ?? 'TODO').trim() as TaskStatus;
  const dueDateTime = String(body.dueDateTime ?? '').trim();

  const allowedStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  if (!title) errors.push({ field: 'title', message: 'Enter a title' });
  if (title.length > 200) errors.push({ field: 'title', message: 'Title must be 200 characters or fewer' });

  if (description && description.length > 10000) {
    errors.push({ field: 'description', message: 'Description must be 10,000 characters or fewer' });
  }

  if (!allowedStatuses.includes(status)) {
    errors.push({ field: 'status', message: 'Select a valid status' });
  }

  if (!dueDateTime) {
    errors.push({ field: 'dueDateTime', message: 'Enter a due date/time' });
  } else if (Number.isNaN(new Date(dueDateTime).getTime())) {
    errors.push({ field: 'dueDateTime', message: 'Enter a valid due date/time' });
  }

  return {
    values: { title, description, status, dueDateTime },
    errors,
  };
}

export default function (app: Application): void {
  // LIST
  app.get('/tasks', async (_req, res) => {
    try {
      const tasks = await listTasks();

      const viewModelTasks = tasks.map((t) => ({
        ...t,
        statusLabel: statusLabel(t.status),
        dueDateTimeLabel: formatDueDateTime(t.dueDateTime),
      }));

      return res.render('tasks/list', { tasks: viewModelTasks });
    } catch {
      return res.render('tasks/list', {
        tasks: [],
        errorMessage: 'Could not load tasks. Is the Task API running on http://localhost:4000?',
      });
    }
  });

  // CREATE (form)
  app.get('/tasks/new', (_req, res) => {
    return res.render('tasks/form', {
      pageTitle: 'Create task',
      formAction: '/tasks/new',
      values: { title: '', description: '', status: 'TODO', dueDateTime: '' },
      errors: [],
    });
  });

  // CREATE (submit)
  app.post('/tasks/new', async (req, res) => {
    const { values, errors } = validateTaskForm(req.body);

    if (errors.length) {
      return res.render('tasks/form', {
        pageTitle: 'Create task',
        formAction: '/tasks/new',
        values,
        errors,
      });
    }

    const payload: TaskRequest = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      dueDateTime: toIsoFromDatetimeLocal(values.dueDateTime),
    };

    try {
      const created = await createTask(payload);
      return res.redirect(`/tasks/${created.id}`);
    } catch {
      return res.render('tasks/form', {
        pageTitle: 'Create task',
        formAction: '/tasks/new',
        values,
        errors: [{ field: 'title', message: 'Could not create task. Is the API running?' }],
      });
    }
  });

  // VIEW
  app.get('/tasks/:id', async (req, res) => {
    try {
      const task = await getTask(req.params.id);
      return res.render('tasks/view', {
        task: {
          ...task,
          statusLabel: statusLabel(task.status),
          dueDateTimeLabel: formatDueDateTime(task.dueDateTime),
        },
      });
    } catch {
      return res.status(404).render('tasks/list', { tasks: [], errorMessage: 'Task not found.' });
    }
  });

  // EDIT (form)
  app.get('/tasks/:id/edit', async (req, res) => {
    try {
      const task: Task = await getTask(req.params.id);

      return res.render('tasks/form', {
        pageTitle: 'Edit task',
        formAction: `/tasks/${task.id}/edit`,
        values: {
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          dueDateTime: toDatetimeLocalValue(task.dueDateTime),
        },
        errors: [],
      });
    } catch {
      return res.status(404).render('tasks/list', { tasks: [], errorMessage: 'Task not found.' });
    }
  });

  // EDIT (submit)
  app.post('/tasks/:id/edit', async (req, res) => {
    const { values, errors } = validateTaskForm(req.body);

    if (errors.length) {
      return res.render('tasks/form', {
        pageTitle: 'Edit task',
        formAction: `/tasks/${req.params.id}/edit`,
        values,
        errors,
      });
    }

    const payload: TaskRequest = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      dueDateTime: toIsoFromDatetimeLocal(values.dueDateTime),
    };

    try {
      await updateTask(req.params.id, payload);
      return res.redirect(`/tasks/${req.params.id}`);
    } catch {
      return res.render('tasks/form', {
        pageTitle: 'Edit task',
        formAction: `/tasks/${req.params.id}/edit`,
        values,
        errors: [{ field: 'title', message: 'Could not update task. Is the API running?' }],
      });
    }
  });

  // STATUS update only
  app.post('/tasks/:id/status', async (req, res) => {
    const status = String(req.body.status ?? '').trim() as TaskStatus;
    const allowedStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).render('tasks/list', { tasks: [], errorMessage: 'Select a valid status.' });
    }

    try {
      await updateTaskStatus(req.params.id, status);
      return res.redirect(`/tasks/${req.params.id}`);
    } catch {
      return res.status(400).render('tasks/list', { tasks: [], errorMessage: 'Could not update status.' });
    }
  });

  // DELETE confirm page
  app.get('/tasks/:id/delete', async (req, res) => {
    try {
      const task = await getTask(req.params.id);
      return res.render('tasks/delete', {
        task: {
          ...task,
          statusLabel: statusLabel(task.status),
          dueDateTimeLabel: formatDueDateTime(task.dueDateTime),
        },
      });
    } catch {
      return res.status(404).render('tasks/list', { tasks: [], errorMessage: 'Task not found.' });
    }
  });

  // DELETE submit
  app.post('/tasks/:id/delete', async (req, res) => {
    try {
      await deleteTask(req.params.id);
      return res.redirect('/tasks');
    } catch {
      return res.status(400).render('tasks/list', { tasks: [], errorMessage: 'Could not delete task.' });
    }
  });
}
