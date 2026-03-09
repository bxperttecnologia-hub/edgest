const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const addUsers = async (playLoad) => {
    const res = await fetch(apiUrl+"/auth/register", {
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

// export const upDateStudent = async (playLoad) => {
//     let token = localStorage.getItem("token");
//     const res = await fetch(`${apiUrl}/students/update/${playLoad?.id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(playLoad),
//     });
//     const data = await res.json();
//     if (!res) false;
//     return data;
// };


export const updateUserStatus = async (playLoad) => {
    const res = await fetch(`${apiUrl}/auth/statusUpdate`, {
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

export const deleteUser = async (id) => {
  if(id){
    const res = await fetch(`${apiUrl}/auth/delete/${id}`, {
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

export const getUsers = async () => {
    const res = await fetch(apiUrl+"/auth/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`
      },
    });
    const data = await res.json();
    if (!res) false;
    return data;
} 