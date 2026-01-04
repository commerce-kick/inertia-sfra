import { router } from "@inertiajs/react"
import { useEffect } from "react"

export default function HomeDemoPage() {
    useEffect(() => {
        router.clearHistory()
        console.log('here')
    }, [])
    return <h1>demo</h1>
}