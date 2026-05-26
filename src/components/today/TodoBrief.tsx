'use client';

import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, ClipboardList, PartyPopper, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { getTodoEncouragement } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Todo } from '@/types';

export function TodoBrief() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const fetchTodos = () => {
    fetch('/api/todos?completed=false&pageSize=5')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTodos(res.data?.todos || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleComplete = async (id: string) => {
    setCompletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        const encouragement = getTodoEncouragement();
        toast.success(encouragement, {
          icon: '🎉',
          style: {
            borderRadius: '16px',
            background: '#FFF8F0',
            color: '#4A4A4A',
            border: '1px solid #FFE4E4',
          },
        });
        setTodos((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      toast.error('操作失败，请重试');
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const allDone = !loading && todos.length === 0;

  return (
    <div className="waibao-card">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-waibao-primary" />
            <span>今日待办</span>
          </div>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            toast('待办功能即将开放～', {
              icon: '📝',
              style: {
                borderRadius: '16px',
                background: '#FFF8F0',
                color: '#4A4A4A',
              },
            });
          }}
        >
          新增
        </Button>
      </CardHeader>

      {loading ? (
        <Loading size="sm" />
      ) : allDone ? (
        <div className="flex flex-col items-center py-6 text-waibao-text-light">
          <PartyPopper className="w-10 h-10 mb-2 text-waibao-yellow-DEFAULT" />
          <p className="text-sm font-medium text-waibao-text">今天任务都完成啦！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-waibao-pink-light/20 transition-colors group"
            >
              <button
                onClick={() => handleComplete(todo.id)}
                disabled={completingIds.has(todo.id)}
                className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  completingIds.has(todo.id)
                    ? 'border-waibao-primary bg-waibao-primary/20'
                    : 'border-waibao-pink-light hover:border-waibao-primary hover:bg-waibao-pink-light/30'
                }`}
              >
                {completingIds.has(todo.id) && (
                  <Loader2 className="w-3 h-3 text-waibao-primary animate-spin" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-waibao-text text-sm truncate">{todo.title}</p>
                {todo.description && (
                  <p className="text-waibao-text-light text-xs mt-0.5 truncate">
                    {todo.description}
                  </p>
                )}
              </div>
              {todo.priority === 'urgent' && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-500">
                  紧急
                </span>
              )}
              {todo.priority === 'high' && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-waibao-yellow-light text-yellow-700">
                  重要
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
