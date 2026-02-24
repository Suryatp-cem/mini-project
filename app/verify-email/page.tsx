"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaEnvelopeOpenText, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function VerifyEmailPage() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-lg border-0 text-center">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-blue-100 p-6 rounded-full">
                                <FaEnvelopeOpenText className="h-12 w-12 text-blue-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            Check your email
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                            We've sent a verification link to your inbox.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-gray-500">
                            Please click the link in the email to verify your account. If you don't see it, check your spam folder.
                        </p>

                        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                            <FaCheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Verification email sent successfully</span>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href="/sign-in">
                                Return to Sign In
                                <FaArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <p className="text-sm text-gray-500">
                            Didn't receive the email?{' '}
                            <button className="text-blue-600 hover:underline font-medium">
                                Resend link
                            </button>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
