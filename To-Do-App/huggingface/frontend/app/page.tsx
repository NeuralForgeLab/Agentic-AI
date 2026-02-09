// Task: T2-008 - Home page
// From: specs/phase2-web/spec.md §4.1
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Todo App</h1>
        <p className="text-lg text-gray-600">
          A simple, powerful task management application
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
