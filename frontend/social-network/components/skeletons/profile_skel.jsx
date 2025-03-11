import React from "react";
import styles from "./skeletons.module.css";

export function SkeletonLoaderPosts() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.div} style={{ height: "200px" }}></div>
      <div className={styles.div} style={{ height: "250px" }}></div>
      <div className={styles.div} style={{ height: "90px" }}></div>
      <div className={styles.div} style={{ height: "150px" }}></div>
      <div className={styles.div} style={{ height: "120px" }}></div>
      <div className={styles.div} style={{ height: "170px" }}></div>
    </div>
  );
};
