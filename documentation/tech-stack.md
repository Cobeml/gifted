# Gifted Tech Stack Guide

## Core Technologies

### Frontend
- **Next.js 14+** with App Router for server-side rendering and routing
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for styling with custom theme configuration
- **Radix UI** primitives for accessible UI components
- **NextAuth.js** for authentication

### Backend
- **Next.js API Routes** for serverless backend functionality
- **AWS DynamoDB** for database storage
- **AWS S3** for file storage
- **AWS API Gateway** for WebSocket support
- **Pinecone** for vector database (AI features)
- **OpenAI** for AI capabilities
- **Stripe** for payment processing and subscription management

### Infrastructure
- **Vercel** for hosting and deployment
- **AWS** for cloud infrastructure
- **GitHub** for version control

## Setting Up a Similar Project

### 1. Project Initialization

```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest your-app-name --typescript --tailwind --app

# Navigate to project directory
cd your-app-name

# Install core dependencies
npm install @auth/dynamodb-adapter next-auth openai @pinecone-database/pinecone
npm install aws-sdk @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install @radix-ui/react-dialog @radix-ui/react-avatar @radix-ui/react-slot
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email (for authentication)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=

# AWS Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
AWS_DYNAMODB_USERS_TABLE=
AWS_API_GATEWAY_ENDPOINT=

# AI Services
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=

# Stripe Configuration
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 3. AWS Setup

1. Create required AWS services:
   - DynamoDB tables for users and data
   - S3 bucket for file storage
   - API Gateway for WebSocket support
   - IAM user with appropriate permissions

2. Configure AWS credentials in your environment

### 4. Authentication Setup

1. Configure NextAuth.js with DynamoDB adapter:
```typescript
// app/api/auth/[...nextauth]/options.ts
import { AuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DynamoDBAdapter } from "@auth/dynamodb-adapter";

export const authOptions: AuthOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],
  adapter: DynamoDBAdapter(ddbDocClient),
  session: {
    strategy: "jwt"
  }
};
```

### 5. Payment Setup

1. Configure Stripe client:
```typescript
// utils/stripe.ts
import { Stripe } from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
```

2. Create Stripe webhook handler:
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { stripe } from '@/utils/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'customer.subscription.created':
        // Handle subscription creation
        break;
      // Add other webhook handlers as needed
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook Error', { status: 400 });
  }
}

### 6. Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── components/       # Reusable components
│   │   ├── auth/        # Authentication components
│   │   ├── ui/          # UI primitives
│   │   └── workspace/   # Feature components
│   └── workspace/       # Feature pages
├── utils/               # Utility functions
│   ├── ai/             # AI-related utilities
│   ├── aws/            # AWS configurations
│   └── openai/         # OpenAI client
├── types/              # TypeScript definitions
└── public/            # Static assets
```

### 7. Development Workflow

1. Start the development server:
```bash
npm run dev
```

2. Access the application at http://localhost:3000

3. Set up linting and formatting:
```bash
# Install development dependencies
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier
```

### 8. Deployment

1. **Vercel Deployment**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy with `git push` to main branch

2. **AWS Configuration**:
   - Set up production AWS resources
   - Configure CORS and security settings
   - Set up monitoring and logging

## Best Practices

### Security
- Use environment variables for sensitive data
- Implement proper authentication flows
- Follow AWS security best practices
- Validate all inputs
- Use proper CORS configuration
- Secure Stripe webhook endpoints
- Never log complete card details
- Use Stripe's test mode in development

### Performance
- Implement caching strategies
- Use static generation where possible
- Optimize database queries
- Implement proper error handling
- Monitor API response times

### Code Quality
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Document complex logic
- Implement proper testing

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Documentation](https://aws.amazon.com/documentation)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 