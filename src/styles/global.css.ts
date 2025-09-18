import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  backgroundColor: vars.color.background,
  color: vars.color.text.primary,
});

globalStyle('*', {
  boxSizing: 'border-box',
});

// Override some Material-UI styles for better veterinary app aesthetics
globalStyle('.MuiPaper-root', {
  borderRadius: vars.borderRadius.md,
});

globalStyle('.MuiButton-root', {
  borderRadius: vars.borderRadius.sm,
  textTransform: 'none', // Keep normal case for better readability
});

globalStyle('.MuiCard-root', {
  boxShadow: vars.shadow.sm,
  transition: 'box-shadow 0.3s ease-in-out',
});

globalStyle('.MuiCard-root:hover', {
  boxShadow: vars.shadow.md,
});
