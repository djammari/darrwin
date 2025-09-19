# 🔗 Sesami Booking Integration Guide

This guide explains how to integrate your VetPractice Pro app with Sesami booking for your Shopify store.

## 🎯 Two-Way Sync Architecture

```
Shopify Store (Sesami) ←→ VetPractice Pro (Darrwin)
```

### **Customer books on Shopify:**
1. Customer selects service and time on your Shopify store
2. Sesami sends webhook to `/api/webhooks/sesami`
3. Appointment appears in your Darrwin calendar
4. You can manage it from your vet practice dashboard

### **You manage from Darrwin:**
1. Create/edit/cancel appointments in Darrwin
2. Changes sync back to Sesami (updates customer's booking)
3. Customer sees updates in their booking confirmation

## 📡 Webhook Setup in Sesami

### **1. Webhook URL**
Configure this URL in your Sesami settings:
```
https://your-app.vercel.app/api/webhooks/sesami
```

### **2. Webhook Events**
Enable these events in Sesami:
- `booking.created` - New booking from customer
- `booking.updated` - Customer changes booking
- `booking.cancelled` - Customer cancels booking

### **3. Webhook Payload**
Your webhook endpoint expects this format:
```json
{
  "event_type": "booking.created",
  "booking": {
    "id": "sesami_booking_123",
    "customer": {
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "service": {
      "name": "Dog Grooming",
      "duration": 60,
      "staff_member": "Dr. Johnson"
    },
    "appointment_time": "2025-09-20T10:00:00Z",
    "status": "confirmed",
    "notes": "First time customer"
  },
  "shop": {
    "domain": "your-store.myshopify.com"
  },
  "timestamp": "2025-09-19T12:00:00Z"
}
```

## 🔄 API Endpoints

### **Appointments API**
- `GET /api/appointments` - Fetch all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/[id]` - Get specific appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### **Webhook API**
- `POST /api/webhooks/sesami` - Receive Sesami booking webhooks
- `GET /api/webhooks/sesami` - Test webhook endpoint

## 🛠️ Setup Steps

### **1. Configure Sesami Webhooks**
In your Sesami dashboard:
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/sesami`
3. Select events: `booking.created`, `booking.updated`, `booking.cancelled`
4. Save configuration

### **2. Add Sesami API Credentials**
Add these to your Vercel environment variables:
```
SESAMI_API_KEY=your_sesami_api_key
SESAMI_WEBHOOK_SECRET=your_webhook_secret
```

### **3. Test the Integration**
1. **Test webhook**: Visit `/api/webhooks/sesami` to verify it's working
2. **Create test booking** in your Shopify store
3. **Check Darrwin calendar** - appointment should appear
4. **Modify appointment** in Darrwin - should sync back to Sesami

## 📅 Calendar Features

### **What's Working Now:**
✅ **Google Calendar-like interface** with week/month/day views  
✅ **Click time slots** to create appointments  
✅ **Patient selection** from your database  
✅ **Color-coded appointments** by status  
✅ **Real-time updates** when webhooks are received  

### **Appointment Status Mapping:**
- **Sesami "confirmed"** → **Darrwin "scheduled"** (Blue)
- **Sesami "pending"** → **Darrwin "scheduled"** (Blue)
- **Sesami "in-progress"** → **Darrwin "in-progress"** (Orange)
- **Sesami "completed"** → **Darrwin "completed"** (Green)
- **Sesami "cancelled"** → **Darrwin "cancelled"** (Red)

## 🔒 Security Considerations

### **Webhook Verification**
Add webhook signature verification:
```typescript
// In /api/webhooks/sesami/route.ts
const signature = request.headers.get('x-sesami-signature');
if (!verifyWebhookSignature(body, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### **API Rate Limiting**
Consider adding rate limiting for the webhook endpoint to prevent abuse.

## 🚀 Scaling Benefits

### **For Your Practice:**
- **Unified calendar** - All appointments in one place
- **Patient management** - Link Shopify customers to patient records
- **Professional interface** - Manage appointments like a medical practice
- **Automatic sync** - No manual data entry

### **For Your Customers:**
- **Easy booking** - Familiar Shopify checkout experience
- **Real-time updates** - See changes immediately
- **Professional service** - Seamless booking experience

## 📋 Next Steps

1. **Test locally**: `pnpm dev` and visit `/calendar`
2. **Configure Sesami webhooks** in your Shopify app
3. **Test webhook integration** with a test booking
4. **Add two-way sync** for appointment modifications
5. **Connect patient records** to Shopify customers

Your veterinary practice now has a **professional booking system** that scales with your business! 🐕👩‍⚕️
