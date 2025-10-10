"use client"
import { useRouter } from "next/navigation";



export default function ResearchPage() {
    const router = useRouter();
    return <div>
        Hello world
        <button onClick={
            () => {
                router.push('/admin/research/create')
            }
        }
            className="border-zinc-800 bg-fuchsia-200"
        >
            Create Research Paper or Upload
        </button>
    </div>
}