import { DynamoDBAdapter } from "@auth/dynamodb-adapter";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { NextAuthOptions, User } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { EmailService } from "@/utils/email-service";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

const ddbDocClient = DynamoDBDocument.from(client);

export const authOptions: NextAuthOptions = {
  adapter: DynamoDBAdapter(ddbDocClient, {
    tableName: process.env.AWS_DYNAMODB_USERS_TABLE!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // First, find the user by email using GSI1
        const userByEmail = await ddbDocClient.query({
          TableName: process.env.AWS_DYNAMODB_USERS_TABLE!,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :email",
          ExpressionAttributeValues: {
            ":email": `EMAIL#${credentials.email.toLowerCase()}`,
          },
          Limit: 1,
        });

        const user = userByEmail.Items?.[0];

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.AWS_SES_AUTH_FROM_EMAIL,
      sendVerificationRequest: async ({ identifier, url }) => {
        const { host } = new URL(url);
        await EmailService.sendAuthEmail(
          identifier,
          "Verify your email for Gifted",
          `
            <div>
              <h1>Welcome to Gifted</h1>
              <p>Click the link below to verify your email address:</p>
              <p><a href="${url}">Verify Email Address</a></p>
              <p>If you did not request this email, you can safely ignore it.</p>
              <hr/>
              <p>This link will expire in 24 hours.</p>
              <p>For security, this request was received from ${host}. If you did not request this email, no action is needed.</p>
            </div>
          `,
          `Verify your email for Gifted\n\nClick the link below to verify your email address:\n\n${url}\n\nIf you did not request this email, you can safely ignore it.\n\nThis link will expire in 24 hours.\n\nFor security, this request was received from ${host}. If you did not request this email, no action is needed.`
        );
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user }: { user: User }) {
      if (user.email) {
        user.email = user.email.toLowerCase();
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/verify-success",
  },
} 