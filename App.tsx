import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

let _nextId = 0;

const DELETE_BUTTON_WIDTH = 80;

interface SwipeableRowProps {
  testID?: string;
  deleteTestID?: string;
  onDeletePress: () => void;
  children: React.ReactNode;
}

function SwipeableRow({
  testID,
  deleteTestID,
  onDeletePress,
  children,
}: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 8,
      onPanResponderGrant: () => {
        translateX.setOffset(currentOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, { dx }) => {
        const total = Math.max(
          -DELETE_BUTTON_WIDTH,
          Math.min(0, currentOffset.current + dx),
        );
        translateX.setValue(total - currentOffset.current);
      },
      onPanResponderRelease: (_, { dx }) => {
        const total = Math.max(
          -DELETE_BUTTON_WIDTH,
          Math.min(0, currentOffset.current + dx),
        );
        translateX.flattenOffset();
        const toValue =
          total < -DELETE_BUTTON_WIDTH / 2 ? -DELETE_BUTTON_WIDTH : 0;
        currentOffset.current = toValue;
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  const handleDeletePress = () => {
    currentOffset.current = 0;
    Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
    onDeletePress();
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeDeleteBackground}>
        <Pressable
          testID={deleteTestID}
          style={styles.swipeDeleteButton}
          onPress={handleDeletePress}
        >
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </Pressable>
      </View>
      <Animated.View
        testID={testID}
        {...panResponder.panHandlers}
        style={[styles.todoItem, {transform: [{translateX}]}]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const addTodo = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setTodos(prev => [
      ...prev,
      { id: String(++_nextId), text: trimmed, completed: false },
    ]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const openEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || !editingTodo) return;
    setTodos(prev =>
      prev.map(t => (t.id === editingTodo.id ? { ...t, text: trimmed } : t)),
    );
    setEditingTodo(null);
    setEditText('');
  };

  const confirmDelete = () => {
    setTodos(prev => prev.filter(t => t.id !== confirmingDeleteId));
    setConfirmingDeleteId(null);
  };

  const remaining = todos.filter(t => !t.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.header}>
        <Text style={styles.title}>TODO List</Text>
        {todos.length > 0 && (
          <Text testID="todo-count" style={styles.count}>
            {remaining} of {todos.length} remaining
          </Text>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputRow}
      >
        <TextInput
          testID="new-todo-input"
          style={styles.input}
          placeholder="Add a new TODO..."
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <Pressable
          testID="add-todo-button"
          style={[
            styles.addButton,
            !inputText.trim() && styles.addButtonDisabled,
          ]}
          onPress={addTodo}
          disabled={!inputText.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </KeyboardAvoidingView>

      {todos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No TODOs yet.</Text>
          <Text style={styles.emptyStateSubText}>
            Add one above to get started!
          </Text>
        </View>
      ) : (
        <ScrollView
          testID="todo-list"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
        >
          {todos.map(item => (
            <SwipeableRow
              key={item.id}
              testID={`todo-item-${item.id}`}
              deleteTestID={`swipe-delete-${item.id}`}
              onDeletePress={() => setConfirmingDeleteId(item.id)}
            >
              <Pressable
                testID={`toggle-todo-${item.id}`}
                style={styles.checkbox}
                onPress={() => toggleTodo(item.id)}
              >
                <Text style={styles.checkboxText}>
                  {item.completed ? '✓' : '○'}
                </Text>
              </Pressable>
              <Text
                testID={`todo-text-${item.id}`}
                style={[styles.todoText, item.completed && styles.todoTextDone]}
                numberOfLines={2}
              >
                {item.text}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  testID={`edit-todo-${item.id}`}
                  style={styles.editButton}
                  onPress={() => openEdit(item)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                  testID={`delete-todo-${item.id}`}
                  style={styles.deleteButton}
                  onPress={() => setConfirmingDeleteId(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </SwipeableRow>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={editingTodo !== null}
        transparent
        animationType="none"
        onRequestClose={() => setEditingTodo(null)}
      >
        <View style={styles.modalOverlay}>
          <View testID="edit-modal" style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit TODO</Text>
            <TextInput
              testID="edit-todo-input"
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={saveEdit}
              returnKeyType="done"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                testID="cancel-edit-button"
                style={styles.modalCancel}
                onPress={() => setEditingTodo(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="save-edit-button"
                style={[
                  styles.modalSave,
                  !editText.trim() && styles.addButtonDisabled,
                ]}
                onPress={saveEdit}
                disabled={!editText.trim()}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmingDeleteId !== null}
        transparent
        animationType="none"
        onRequestClose={() => setConfirmingDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View testID="delete-confirm-modal" style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete TODO</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this item?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                testID="cancel-delete-button"
                style={styles.modalCancel}
                onPress={() => setConfirmingDeleteId(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="confirm-delete-button"
                style={styles.deleteConfirmButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  count: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#c7c5f4',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  checkbox: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 20,
    color: '#4f46e5',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  editButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#888',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#4f46e5',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  confirmText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  modalSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
  },
  modalSaveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  deleteConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  deleteConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  swipeContainer: {
    borderRadius: 12,
  },
  swipeDeleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 12,
    overflow: 'hidden',
  },
  swipeDeleteButton: {
    width: DELETE_BUTTON_WIDTH,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
