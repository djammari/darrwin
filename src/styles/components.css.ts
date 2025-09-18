import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars, vetColors } from './theme.css';

// Example: Custom card styles that work with Material UI
export const vetCard = style({
  borderRadius: vars.borderRadius.md,
  padding: vars.space.lg,
  backgroundColor: vars.color.surface,
  boxShadow: vars.shadow.sm,
  transition: 'all 0.3s ease-in-out',
  
  ':hover': {
    boxShadow: vars.shadow.md,
    transform: 'translateY(-2px)',
  },
});

// Patient card with different states
export const patientCard = recipe({
  base: {
    borderRadius: vars.borderRadius.md,
    padding: vars.space.md,
    margin: vars.space.sm,
    backgroundColor: vars.color.background,
    border: '2px solid transparent',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  },
  
  variants: {
    status: {
      active: {
        borderColor: vetColors.appointment.scheduled,
        backgroundColor: vetColors.calm.blue,
      },
      completed: {
        borderColor: vetColors.appointment.completed,
        backgroundColor: vetColors.calm.green,
      },
      urgent: {
        borderColor: vetColors.priority.urgent,
        backgroundColor: '#ffebee',
      },
    },
    size: {
      small: {
        padding: vars.space.sm,
      },
      medium: {
        padding: vars.space.md,
      },
      large: {
        padding: vars.space.lg,
      },
    },
  },
  
  defaultVariants: {
    status: 'active',
    size: 'medium',
  },
});

// Calendar appointment slot styles
export const appointmentSlot = recipe({
  base: {
    borderRadius: vars.borderRadius.sm,
    padding: vars.space.xs,
    fontSize: '0.875rem',
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  variants: {
    status: {
      scheduled: {
        backgroundColor: vetColors.appointment.scheduled,
      },
      inProgress: {
        backgroundColor: vetColors.appointment.inProgress,
      },
      completed: {
        backgroundColor: vetColors.appointment.completed,
      },
      cancelled: {
        backgroundColor: vetColors.appointment.cancelled,
      },
      rescheduled: {
        backgroundColor: vetColors.appointment.rescheduled,
      },
    },
  },
  
  defaultVariants: {
    status: 'scheduled',
  },
});
