"use client";

interface StepIndicatorProps {
    currentStep: number;
    onStepClick: (step: number) => void;
}

const STEPS = ["PRODUCT", "MARKET", "POPULATION", "PREVIEW"];

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
    return (
        <div className="step-indicator">
            {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                const isClickable = stepNum < currentStep;

                return (
                    <div key={label} className="step-indicator-item">
                        {i > 0 && (
                            <div
                                className="step-indicator-line"
                                style={{
                                    background: isCompleted || isCurrent ? "var(--orange)" : "var(--border)",
                                }}
                            />
                        )}
                        <button
                            className="step-indicator-dot-wrap"
                            onClick={() => isClickable && onStepClick(stepNum)}
                            disabled={!isClickable}
                            style={{ cursor: isClickable ? "pointer" : "default" }}
                        >
                            <div
                                className="step-indicator-dot"
                                style={{
                                    background: isCurrent
                                        ? "var(--orange)"
                                        : isCompleted
                                            ? "var(--support)"
                                            : "var(--border)",
                                    borderColor: isCurrent
                                        ? "var(--orange)"
                                        : isCompleted
                                            ? "var(--support)"
                                            : "var(--border)",
                                }}
                            >
                                {isCompleted && (
                                    <span style={{ fontSize: 10, color: "#000", fontWeight: 700 }}>✓</span>
                                )}
                            </div>
                            <span
                                className="step-indicator-label"
                                style={{
                                    color: isCurrent
                                        ? "var(--orange)"
                                        : isCompleted
                                            ? "var(--support)"
                                            : "var(--muted)",
                                }}
                            >
                                {label}
                            </span>
                            <span className="step-indicator-num">Step {stepNum}</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
