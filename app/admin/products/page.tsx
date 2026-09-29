"use client"

import { useState } from "react"


export default function ProductsAdmin(){


const [name,setName] = useState("")
const [category,setCategory] = useState("")
const [description,setDescription] = useState("")


function save(){

alert(
"产品已保存："+name
)

}


return (

<div className="min-h-screen bg-gray-100 p-10">


<h1 className="text-3xl font-bold mb-8">

产品管理

</h1>


<div className="bg-white p-8 rounded-xl shadow max-w-xl">


<label>
产品名称
</label>

<input

className="border p-3 w-full mb-4 rounded"

placeholder="例如：Durable Dog Bite Toy"

value={name}

onChange={(e)=>setName(e.target.value)}

/>



<label>
产品分类
</label>

<input

className="border p-3 w-full mb-4 rounded"

placeholder="Dog Toy / Training Equipment"

value={category}

onChange={(e)=>setCategory(e.target.value)}

/>



<label>
产品描述
</label>


<textarea

className="border p-3 w-full mb-4 rounded h-32"

placeholder="产品介绍..."

value={description}

onChange={(e)=>setDescription(e.target.value)}

/>



<button

onClick={save}

className="bg-black text-white px-8 py-3 rounded"

>

保存产品

</button>


</div>


</div>

)

}
