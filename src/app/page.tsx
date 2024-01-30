import db from '@/lib/db'

export default async function Home() {
	const [results] = await db.query('SELECT * FROM products', ['Page', 45])
	console.log(results)
	let res = JSON.stringify(results)
	return (
		<main className="bg-white">
			<h1>{res}</h1>
			<h1 className="text-8xl text-center uppercase">Project Of The Day</h1>
		</main>
	)
}
