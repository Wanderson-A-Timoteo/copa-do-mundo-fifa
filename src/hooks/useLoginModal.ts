import { useState } from "react";

export function useLoginModal() {
  const [showModalLogin, setShowModalLogin] = useState(false);

  const openModal = () => setShowModalLogin(true);
  const closeModal = () => setShowModalLogin(false);
  const toggleModal = () => setShowModalLogin((prev) => !prev);

  return { showModalLogin, openModal, closeModal, toggleModal, setShowModalLogin };
}
