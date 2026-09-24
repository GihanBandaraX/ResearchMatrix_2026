import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();
        
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // If the user does not exist, create a new user in the database
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        
        return true;
      } catch (error) {
        console.log("Error saving user to database:", error);
        return false;
      }
    },
  },
});

{/* @ts-ignore */}
export { handler as GET, handler as POST };