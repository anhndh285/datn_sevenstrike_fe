const API_GIAO_CA = "http://localhost:8080/api/giao-ca";

const unwrapJson = async (res) => {
  if (res.status === 204) return null; // No content
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

const handleResponse = async (response) => {
    // 204 No Content: Trả về null
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        // Ném lỗi kèm message từ Backend nếu có
        const error = new Error(data.message || 'Có lỗi xảy ra');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

export const checkActiveCa = async (idNhanVien) => {
    const response = await fetch(`${API_GIAO_CA}/check-active/${idNhanVien}`);
    return handleResponse(response);
};

export const getCaTruocGanNhat = () => {
  return axios.get('/api/giao-ca/ca-truoc')
    .then(res => res.data);
};

export const batDauCa = async (payload) => {
    const response = await fetch(`${API_GIAO_CA}/bat-dau`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const ketThucCa = async (idGiaoCa, payload) => {
    const response = await fetch(`${API_GIAO_CA}/ket-thuc/${idGiaoCa}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};