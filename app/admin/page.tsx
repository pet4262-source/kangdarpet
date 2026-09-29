"use client"


import Link from "next/link"


export default function AdminHome(){


return (

<div className="min-h-screen bg-gray-100 p-10">


<h1 className="text-3xl font-bold mb-8">
KANGDARPET 管理后台
</h1>


<div className="grid md:grid-cols-3 gap-6">


<Link href="/admin/products">

<div className="bg-white p-8 rounded-xl shadow cursor-pointer">

<h2 className="text-xl font-bold">
产品管理
</h2>

<p className="mt-2 text-gray-500">
添加产品、修改产品、上传图片
</p>

</div>

</Link>



<Link href="/admin/inquiries">

<div className="bg-white p-8 rounded-xl shadow cursor-pointer">

<h2 className="text-xl font-bold">
客户询盘
</h2>

<p className="mt-2 text-gray-500">
查看海外客户留言
</p>

</div>

</Link>




<Link href="/admin/news">

<div className="bg-white p-8 rounded-xl shadow cursor-pointer">

<h2 className="text-xl font-bold">
新闻管理
</h2>

<p className="mt-2 text-gray-500">
发布公司动态
</p>

</div>

</Link>


</div>


</div>


)


}
