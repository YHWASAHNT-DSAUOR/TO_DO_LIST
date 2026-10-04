import React, { useState, useRef } from 'react';
import { Check, Trash2, GripVertical, Edit2 } from 'lucide-react';
import type { Subtask } from '../types';
import { useTodo } from '../context/TodoContext';

interface SubtaskItemProps {
  taskId: string;
  subtask: Subtask;
  index: number;
  isLast: boolean;
  topicColor: string;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  taskId,
  subtask,
  index,
  isLast,
  topicColor
}) => {
  const { toggleSubtask, updateSubtask, deleteSubtask, reorderSubtasks } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateSubtask(taskId, subtask.id, { title: editTitle.trim() });
    } else {
      setEditTitle(subtask.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(subtask.title);
      setIsEditing(false);
    }
  };

  // Drag and Drop handlers for subtasks
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'SUBTASK',
      taskId,
      subtaskId: subtask.id,
      index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'SUBTASK' && data.taskId === taskId && data.index !== index) {
        reorderSubtasks(taskId, data.index, index);
      }
    } catch {
      // Ignore drop error
    }
  };

  return (
    <div
      ref={itemRef}
      className={`subtask-row ${subtask.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Tree connector branch guide */}
      <div className="subtask-tree-guide">
        <span className="tree-line-vertical" />
        <span className="tree-line-horizontal" />
        {isLast && <span className="tree-line-corner" />}
      </div>

      <div className="subtask-content-card">
        <div className="subtask-drag-handle" title="Drag to reorder subtask">
          <GripVertical size={13} />
        </div>

        {/* Custom checkbox */}
        <button
          type="button"
          className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
          style={{
            borderColor: subtask.completed ? topicColor : undefined,
            backgroundColor: subtask.completed ? topicColor : undefined
          }}
          onClick={() => toggleSubtask(taskId, subtask.id)}
          aria-label={subtask.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
        >
          {subtask.completed && <Check size={11} strokeWidth={3} color="#FFFFFF" />}
        </button>

        {/* Subtask Title or Edit Input */}
        {isEditing ? (
          <input
            type="text"
            className="subtask-inline-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="subtask-title-text"
            onDoubleClick={() => setIsEditing(true)}
            title="Double click to edit"
          >
            {subtask.title}
          </span>
        )}

        {/* Action buttons on hover */}
        <div className="subtask-actions">
          {!isEditing && (
            <button
              type="button"
              className="subtask-action-btn"
              onClick={() => setIsEditing(true)}
              title="Edit subtask"
            >
              <Edit2 size={12} />
            </button>
          )}
          <button
            type="button"
            className="subtask-action-btn delete"
            onClick={() => deleteSubtask(taskId, subtask.id)}
            title="Delete subtask"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
