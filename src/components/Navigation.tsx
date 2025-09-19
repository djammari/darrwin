'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  Home as HomeIcon,
  Pets as PetsIcon,
  CalendarToday as CalendarIcon,
  BugReport as TestIcon
} from '@mui/icons-material';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'Patients', href: '/patients', icon: <PetsIcon /> },
    { label: 'Calendar', href: '/calendar', icon: <CalendarIcon /> },
    { label: 'Test Webhook', href: '/test-webhook', icon: <TestIcon /> },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: 'primary.main', mb: 0 }}>
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🐾 VetPractice Pro
          </Typography>
          
          <Box display="flex" gap={1}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    backgroundColor: pathname === item.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
