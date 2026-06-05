import React, { useState } from "react";
import PostJobModal from "./PostJobModal";

const Header = ({ jobOpenings, setJobOpenings }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="recruitment-header">
        <button className="btn-post-job" onClick={() => setShowModal(true)}>
          Post new jobs +
        </button>
      </div>
      {showModal && (
        <PostJobModal
          onClose={() => setShowModal(false)}
          onJobPosted={(newJob) => {
            setJobOpenings((prev) => [...prev, newJob]);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default Header;