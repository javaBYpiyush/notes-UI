import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE;

export const api = {
  // list
  getNotes: () => axios.get(`${BASE}/getnote`).then(r => r.data),

  // by id
  getNote: (id) => axios.get(`${BASE}/note/${id}`).then(r => r.data),

  // create
  createNote: (payload) =>
    axios.post(`${BASE}/note`, payload).then(r => r.data),

  // update
  updateNote: (id, payload) =>
    axios.put(`${BASE}/note/${id}`, payload).then(r => r.data),

  // delete
  deleteNote: (id) => axios.delete(`${BASE}/note/${id}`),

  // by shareId (public)
  getPublicNote: (shareId) =>
    axios.get(`${BASE}/note/share/${shareId}`).then(r => r.data),
};
