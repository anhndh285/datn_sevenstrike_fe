const API = 'http://localhost:8080/api/admin/dia-chi-khach-hang'

export const getAllDiaChi = async () => {
  const res = await fetch(API, {
    method: 'GET',
  })
  if (!res.ok) throw new Error('Load du lieu khong thanh cong')
  return await res.json()
}

export const addDiaChi = async (data) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.text()
    throw new Error('Thêm thất bại: ' + errorData)
  }
  return await res.json()
}

export const updateDiaChi = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Cập nhật thất bại')
}