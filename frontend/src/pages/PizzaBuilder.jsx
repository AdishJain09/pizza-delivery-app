import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../services/api.js";

const steps = ["base", "sauce", "cheese", "vegetable"];
const stepTitles = {
  base: "Choose a base",
  sauce: "Choose a sauce",
  cheese: "Choose a cheese",
  vegetable: "Choose your vegetables"
};

const PizzaBuilder = () => {
  const [options, setOptions] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({ base: "", sauce: "", cheese: "", vegetable: [] });
  const navigate = useNavigate();

  useEffect(() => {
    userApi.get("/inventory/options").then(({ data }) => setOptions(data));
  }, []);

  if (!options) return <div className="page">Loading ingredients...</div>;

  const category = steps[stepIndex];
  const items = options[category];

  const toggleVegetable = (name) => {
    setSelection((prev) => {
      const exists = prev.vegetable.includes(name);
      return {
        ...prev,
        vegetable: exists
          ? prev.vegetable.filter((v) => v !== name)
          : [...prev.vegetable, name]
      };
    });
  };

  const selectSingle = (name) => setSelection((prev) => ({ ...prev, [category]: name }));

  const canProceed =
    category === "vegetable" ? selection.vegetable.length > 0 : !!selection[category];

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      navigate("/order-summary", { state: selection });
    }
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <div className="page">
      <div className="builder-progress">
        Step {stepIndex + 1} of {steps.length}
      </div>
      <h2>{stepTitles[category]}</h2>
      <div className="ingredient-grid">
        {items.map((item) => {
          const active =
            category === "vegetable"
              ? selection.vegetable.includes(item.name)
              : selection[category] === item.name;
          return (
            <button
              key={item.id}
              disabled={!item.inStock}
              className={`ingredient-btn ${active ? "active" : ""}`}
              onClick={() =>
                category === "vegetable" ? toggleVegetable(item.name) : selectSingle(item.name)
              }
            >
              {item.name}
              {!item.inStock && <span className="badge">out of stock</span>}
            </button>
          );
        })}
      </div>
      <div className="builder-nav">
        <button onClick={back} disabled={stepIndex === 0}>Back</button>
        <button onClick={next} disabled={!canProceed}>
          {stepIndex === steps.length - 1 ? "Review Order" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default PizzaBuilder;
