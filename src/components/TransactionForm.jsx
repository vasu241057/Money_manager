import React, { useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { BottomSheetSelect } from "./ui/BottomSheetSelect";
import { DatePicker } from "./ui/DatePicker";
import { BottomSheetDatePicker } from "./ui/BottomSheetDatePicker";
import { X } from "lucide-react";
import "../styles/transaction-form.css";

export function TransactionForm({ onSubmit, onClose, initialData = null }) {
  const { categories } = useCategories();
  const [type, setType] = useState(initialData?.type || "expense");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split("T")[0]
  );

  // Find category ID by name if editing
  const initialCategoryId = initialData
    ? categories.find((c) => c.name === initialData.category)?.id
    : "";

  const [categoryId, setCategoryId] = useState(initialCategoryId || "");
  const [subCategory, setSubCategory] = useState(
    initialData?.subCategory || ""
  );
  const [account, setAccount] = useState(initialData?.account || "Cash");
  const [description, setDescription] = useState(initialData?.description || "");

  useEffect(() => {
    if (initialData && categories.length > 0) {
      const cat = categories.find((c) => c.name === initialData.category);
      if (cat) {
        setCategoryId(cat.id);
      }
    }
  }, [categories, initialData]);

  // Reset sub-category when category changes
  useEffect(() => {
    if (!initialData) {
      // Only reset if not editing initially (or handle smarter)
      // Actually we should reset subCategory if the new category doesn't contain it
      // But for now let's just clear it on category change if it's not valid
      const cat = categories.find((c) => c.id === categoryId);
      if (cat && subCategory && !cat.subCategories?.includes(subCategory)) {
        setSubCategory("");
      }
    }
  }, [categoryId, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount) {
      alert("Please enter an amount");
      console.log("amount is empty");
      return;
    }
    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);

    try {
      onSubmit({
        id: initialData?.id, // Pass ID if editing
        amount: parseFloat(amount),
        type,
        date,
        category: selectedCategory?.name || "Uncategorized",
        subCategory,
        account,
        description,
      });

      // Small delay to ensure iOS handles the event correctly before unmounting
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(error.message || "An error occurred while saving the transaction.");
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const subCategories = selectedCategoryObj?.subCategories || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-toggle-container">
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${
                  type === "expense" ? "active expense" : ""
                }`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-btn ${
                  type === "income" ? "active income" : ""
                }`}
                onClick={() => setType("income")}
              >
                Income
              </button>
            </div>
          </div>

          <Input
            type="number"
            placeholder="0"
            className="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <BottomSheetDatePicker
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={!date ? "Date is required" : ""}
          />

          <div className="category-section">
            <label className="input-label">Category</label>
            <div className="category-chips">
              {categories
                .filter((c) => c.type === type)
                .map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    className={`chip ${categoryId === cat.id ? "active" : ""}`}
                    onClick={() => setCategoryId(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {subCategories.length > 0 && (
            <div className="category-section" style={{ marginTop: 12 }}>
              <label className="input-label">Sub-category</label>
              <div className="category-chips">
                {subCategories.map((sub) => (
                  <button
                    type="button"
                    key={sub}
                    className={`chip ${subCategory === sub ? "active" : ""}`}
                    onClick={() => setSubCategory(sub)}
                    style={{ fontSize: "12px", padding: "4px 10px" }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <BottomSheetSelect
            label="Account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Bank", label: "Bank" },
              { value: "Card", label: "Card" },
            ]}
          />

          <Input
            label="Note"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note"
          />

          <Button type="submit" variant="primary" className="submit-btn">
            Save Transaction
          </Button>
        </form>
      </div>
    </div>
  );
}
