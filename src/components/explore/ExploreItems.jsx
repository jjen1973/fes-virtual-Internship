import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Countdown from "../UI/Countdown";

const EXPLORE_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";
const INITIAL_ITEMS = 8;
const LOAD_MORE_COUNT = 4;

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchItems() {
      try {
        const { data } = await axios.get(EXPLORE_URL, {
          signal: controller.signal,
          timeout: 15000,
        });
        if (!Array.isArray(data)) throw new Error("Unexpected explore response");
        if (!controller.signal.aborted) setItems(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError("Unable to load Explore items. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchItems();
    return () => controller.abort();
  }, []);

  const sortedItems = useMemo(() => {
    const nextItems = [...items];
    if (sortBy === "price_low_to_high") return nextItems.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high_to_low") return nextItems.sort((a, b) => b.price - a.price);
    if (sortBy === "likes_high_to_low") return nextItems.sort((a, b) => b.likes - a.likes);
    return nextItems;
  }, [items, sortBy]);

  const visibleItems = sortedItems.slice(0, visibleCount);

  return (
    <>
      <div className="col-12">
        <select
          id="filter-items"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort Explore items"
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>
      {loading && <p className="col-12" role="status">Loading Explore items...</p>}
      {error && <p className="col-12" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="col-12">No Explore items available.</p>
      )}
      {!loading && !error && visibleItems.map((item) => (
        <div key={item.id} className="d-item explore-item col-md-3 col-sm-6 col-xs-12">
          <div className="nft__item explore-item-card">
            <div className="author_list_pp">
              <Link to={`/${item.authorId}/author`} title={`View creator of ${item.title}`}>
                <img className="lazy" src={item.authorImage} alt={`Creator of ${item.title}`} />
                <i className="fa fa-check" aria-hidden="true"></i>
              </Link>
            </div>
            <Countdown expiryDate={item.expiryDate} />
            <div className="nft__item_wrap">
              <Link to={`/explore/item/${item.id}`}>
                <img src={item.nftImage} className="lazy nft__item_preview" alt={item.title} />
              </Link>
            </div>
            <div className="nft__item_info">
              <Link to={`/explore/item/${item.id}`}><h4>{item.title}</h4></Link>
              <div className="nft__item_price">{Number(item.price).toFixed(2)} ETH</div>
              <div className="nft__item_like">
                <i className="fa fa-heart" aria-hidden="true"></i>
                <span>{item.likes}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {!loading && !error && visibleCount < sortedItems.length && (
        <div className="col-md-12 text-center">
          <button
            type="button"
            id="loadmore"
            className="btn-main lead"
            onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
};

export default ExploreItems;
