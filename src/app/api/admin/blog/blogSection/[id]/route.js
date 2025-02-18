export async function GET(request, { params }) {
  const { id } = await params; // await 처리 추가
  try {
    const res = await fetch(`http://localhost:8080/api/blogs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ message: `Failed to fetch blog with id: ${id}` }),
        { status: res.status }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("블로그 데이터 가져오기에 실패했습니다.", error);
    return new Response(
      JSON.stringify({ message: "Server Error", error: error.message }),
      { status: 500 }
    );
  }
}
