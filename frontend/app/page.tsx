"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center md:flex-row md:justify-between gap-8">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
              Manage Projects & Tasks Effortlessly
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-xl mx-auto md:mx-0">
              A powerful dashboard to track your projects, collaborate with your team, 
              and stay productive.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                href="/dashboard"
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-medium shadow hover:bg-gray-100 transition"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/projects"
                className="bg-transparent border border-white px-6 py-3 rounded-xl font-medium hover:bg-white hover:text-blue-700 transition"
              >
                View Projects
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <Image
              src="/project_management.png"
              alt="Project Management Illustration"
              width={500}
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Why Choose Us?</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-900">Project Tracking</h3>
            <p className="text-gray-600 mt-2">
              Stay on top of your ongoing projects with clear overviews and progress updates.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-900">Task Management</h3>
            <p className="text-gray-600 mt-2">
              Organize, assign, and track tasks across your team with ease.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-900">Team Collaboration</h3>
            <p className="text-gray-600 mt-2">
              Empower your team with tools to collaborate and communicate effectively.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-4 text-blue-100">
          Jump into your dashboard and take control of your work today.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-medium shadow hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
