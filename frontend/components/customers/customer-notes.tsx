'use client';

/**
 * Customer Notes Component
 * 
 * Displays and manages customer notes with history
 * Allows staff to add, edit, and view customer interaction notes
 */

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Edit, 
  Save, 
  Trash2,
  Plus
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for a note
interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Props interface
interface CustomerNotesProps {
  customerId: string;
  customerName: string;
  initialNotes?: Note[];
}

/**
 * Customer Notes Component
 */
export function CustomerNotes({
  customerId,
  customerName,
  initialNotes = [],
}: CustomerNotesProps) {
  // State for notes
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  // Mock current user (would come from auth context in a real app)
  const currentUser = {
    id: 'user_1',
    name: 'Admin User',
    avatarUrl: ''
  };
  
  /**
   * Handle adding a new note
   */
  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      console.log(`Adding note for customer ${customerId}: ${newNoteContent}`);
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new note object
      const newNote: Note = {
        id: `note_${Date.now()}`,
        content: newNoteContent,
        createdAt: new Date().toISOString(),
        createdBy: currentUser
      };
      
      // Update state
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
      
      // Show success message
      toast({
        title: "Note Added",
        description: "Your note has been successfully added."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive"
      });
      console.error("Error adding note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Start editing a note
   */
  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };
  
  /**
   * Cancel editing a note
   */
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditContent('');
  };
  
  /**
   * Save edited note
   */
  const saveEditedNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      console.log(`Updating note ${noteId}: ${editContent}`);
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              content: editContent,
              updatedAt: new Date().toISOString()
            } 
          : note
      ));
      
      // Reset editing state
      setEditingNoteId(null);
      setEditContent('');
      
      // Show success message
      toast({
        title: "Note Updated",
        description: "Your note has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Delete a note
   */
  const deleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call
      console.log(`Deleting note ${noteId}`);
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state
      setNotes(notes.filter(note => note.id !== noteId));
      
      // Reset editing state if deleting the note being edited
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditContent('');
      }
      
      // Show success message
      toast({
        title: "Note Deleted",
        description: "The note has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  /**
   * Generate initials for avatar fallback
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Customer Notes
        </CardTitle>
        <CardDescription>
          Internal notes and history for {customerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Note */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Add a Note</h3>
          <Textarea
            placeholder="Enter your note about this customer..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote} 
              disabled={!newNoteContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Notes List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Note History</h3>
          
          {notes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notes for this customer yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-muted/50 rounded-lg p-4 space-y-3"
                >
                  {/* Note Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={note.createdBy.avatarUrl} />
                        <AvatarFallback>
                          {getInitials(note.createdBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">
                          {note.createdBy.name}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(note.createdAt)}
                          {note.updatedAt && ` (edited ${formatDate(note.updatedAt)})`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1">
                      {editingNoteId !== note.id ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditingNote(note)}
                            disabled={isSubmitting}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={cancelEditingNote}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => saveEditedNote(note.id)}
                            disabled={!editContent.trim() || isSubmitting}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Note Content */}
                  {editingNoteId === note.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                    />
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 