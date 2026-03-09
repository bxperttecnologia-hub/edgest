const apiUrl = import.meta.env.VITE_API_URL;

export const addStudent = async (playLoad) => {
    let token = localStorage.getItem("token");
    const res = await fetch(apiUrl+"/students/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(playLoad),
    });
    const data = await res.json();
    if (!res) false;
    return data;
};

export const upDateStudent = async (playLoad) => {
    let token = localStorage.getItem("token");
    const res = await fetch(`${apiUrl}/students/update/${playLoad?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(playLoad),
    });
    const data = await res.json();
    if (!res) false;
    return data;
};

export const deleteStudent = async (id) => {
  if(id){
    const res = await fetch(`${apiUrl}/students/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (!res) false;
    return data;
  }

  return false;
};

export const getStudents = async (playLoad = {}) => {
    let token = localStorage.getItem("token");
    const res = await fetch(apiUrl+"/students/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(playLoad),
    });
    const data = await res.json();
    if (!res) false;
    return data?.students;
} 