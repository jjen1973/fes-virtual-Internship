import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import ExploreItems from "./ExploreItems";

jest.mock("axios");

test("shows 8 API items first and loads 4 more per click", async () => {
  jest.spyOn(Date, "now").mockReturnValue(1000000);
  const items = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    authorId: 2000 + index,
    authorImage: `/author-${index + 1}.jpg`,
    nftImage: `/nft-${index + 1}.jpg`,
    title: `Explore Item ${index + 1}`,
    price: index + 0.5,
    likes: index + 10,
    expiryDate: index === 0 ? 1005000 : null,
  }));
  axios.get.mockResolvedValue({ data: items });

  try {
    const { container } = render(<MemoryRouter><ExploreItems /></MemoryRouter>);
    await screen.findByText("Explore Item 8");

    expect(container.querySelectorAll(".nft__item")).toHaveLength(8);
    expect(container.querySelector(".explore-item")).toHaveClass("col-md-3", "col-sm-6", "col-xs-12");
    expect(screen.queryByText("Explore Item 9")).not.toBeInTheDocument();
    expect(screen.getByText("0h 0m 5s")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View creator of Explore Item 1" })).toHaveAttribute(
      "href",
      "/2000/author"
    );
    expect(screen.getAllByRole("link", { name: "Explore Item 1" })[0]).toHaveAttribute(
      "href",
      "/explore/item/1"
    );

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(container.querySelectorAll(".nft__item")).toHaveLength(12);
    expect(screen.getByText("Explore Item 12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(container.querySelectorAll(".nft__item")).toHaveLength(16);
    expect(screen.getByText("Explore Item 16")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  } finally {
    Date.now.mockRestore();
  }
});
