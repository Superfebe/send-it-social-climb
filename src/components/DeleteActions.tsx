
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteSessionDialogProps {
  sessionId: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function DeleteSessionDialog({ sessionId, onSuccess, children }: DeleteSessionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First delete all ascents associated with this session
      const { error: ascentsError } = await supabase
        .from('ascents')
        .delete()
        .eq('session_id', sessionId);

      if (ascentsError) throw ascentsError;

      // Then delete session comments
      const { error: commentsError } = await supabase
        .from('session_comments')
        .delete()
        .eq('session_id', sessionId);

      if (commentsError) throw commentsError;

      // Then delete session likes
      const { error: likesError } = await supabase
        .from('session_likes')
        .delete()
        .eq('session_id', sessionId);

      if (likesError) throw likesError;

      // Finally delete the session
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      toast({
        title: "Session deleted",
        description: "The session and all associated climbs have been removed.",
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Delete Session
          </DialogTitle>
          <DialogDescription>
            This will permanently delete the session and all associated climbs, comments, and likes. 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteClimbDialogProps {
  climbId: string;
  climbName: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function DeleteClimbDialog({ climbId, climbName, onSuccess, children }: DeleteClimbDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('ascents')
        .delete()
        .eq('id', climbId);

      if (error) throw error;

      toast({
        title: "Climb deleted",
        description: `${climbName} has been removed from your logbook.`,
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting climb:', error);
      toast({
        title: "Error",
        description: "Failed to delete climb. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Delete Climb
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{climbName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Climb'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
