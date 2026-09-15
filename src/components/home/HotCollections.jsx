import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCollections() {
      try {
        const { data } = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
          { signal: controller.signal, timeout: 15000 }
        );
        if (!Array.isArray(data)) {
          throw new Error("Unexpected collection response");
        }
        if (!controller.signal.aborted) setCollections(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError("Unable to load hot collections. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchCollections();
    return () => controller.abort();
  }, []);

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
          {loading && <p role="status">Loading hot collections...</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && !error && collections.length === 0 && (
            <p>No hot collections available.</p>
          )}
          {collections.map((collection) => (
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={collection.id}>
              <div className="nft_coll">
                <div className="nft_wrap">
                  <Link to="/item-details">
                    <img src={collection.nftImage} className="lazy img-fluid" alt={collection.title} />
                  </Link>
                </div>
                <div className="nft_coll_pp">
                  <Link to="/author">
                    <img className="lazy pp-coll" src={collection.authorImage} alt="" />
                  </Link>
                  <i className="fa fa-check"></i>
                </div>
                <div className="nft_coll_info">
                  <Link to="/explore">
                    <h4>{collection.title}</h4>
                  </Link>
                  <span>ERC-{collection.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotCollections;
