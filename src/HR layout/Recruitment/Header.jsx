import React, { useState } from "react";
import PostJobModal from "./PostJobModal";

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="recruitment-header">
        <h1 className="recruitment-title">Recruitment</h1>
        <button className="btn-post-job" onClick={() => setShowModal(true)}>
          Post new jobs +
        </button>
      </div>

      {showModal && <PostJobModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Header;
