export const logout = () => {
  const keepSession = localStorage.getItem("rememberMe");

  if (keepSession) {
    // Mantém apenas email
    const email = localStorage.getItem("email");
    localStorage.clear();
    localStorage.setItem("email", email ?? "");
  } else {
    localStorage.clear();
  }

  window.location.href = "/";
};
