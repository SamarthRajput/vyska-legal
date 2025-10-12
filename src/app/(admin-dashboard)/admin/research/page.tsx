"use client"
import { useRouter } from "next/navigation";



export default function ResearchPage() {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
                Research Papers
            </h1>
            <p className="text-gray-600 mb-8 text-center text-base md:text-lg">
                Create a new research paper or upload an existing one to the platform.
            </p>
            <button
                onClick={() => router.push('/admin/research/create')}
                className="px-6 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2"
            >
                Create Research Paper or Upload
            </button>
        </div>
    );
}