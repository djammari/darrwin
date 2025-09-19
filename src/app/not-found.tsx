import Link from 'next/link';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'text.secondary' }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Box>
        <Link href="/" passHref>
          <Button variant="contained" startIcon={<HomeIcon />} size="large">
            Go Home
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
