import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'manager' | 'rep';
      organizationId: string;
      stage: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    organizationId: string;
    userId: string;
    stage: number;
  }
}
