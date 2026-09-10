import { expect, spec } from "@openwork/testkit";
import { modelPicker } from "../worlds/chat.ts";

const test = spec.world(modelPicker);

test("the composer model pickers keep their controls without the OpenWork Models subscribe promo", async ({ user, probe, step }) => {
  const draft = "Keep this draft while editing model settings.";
  await user.type("composer", draft);
  const initial = await probe.composer();
  await user.click({ role: "button", label: "Change model" });
  await user.click({ role: "button", label: /^Model\s+Big Pickle/ });

  await step("the compact picker keeps controls without subscribe promotion", async () => {
    await user.see({ placeholder: "Search models..." });
    await user.see({ role: "button", label: "All models" });
    await user.see({ role: "button", label: "Connect more providers" });
    for (const removed of [
      "Your API keys",
      "Add your keys",
      "hosted · no API keys",
      "One subscription unlocks these in every workspace.",
      "Enable →",
      "Sign in →",
      "Hide",
    ]) await user.notSee({ text: removed });
  });

  await user.click({ role: "button", label: "All models" });
  await step("the full Models dialog keeps controls without subscribe promotion", async () => {
    await user.see({ text: "Models" });
    await user.see({ text: "Select a model for this session." });
    await user.see({ placeholder: "Search providers and models..." });
    await user.see({ role: "button", label: "Done" });
    await user.notSee({ role: "button", label: "Hide OpenWork Models" });
    await user.notSee({ text: "Subscribe to use hosted frontier models in this workspace." });
    await user.notSee({ text: "Sign in to unlock hosted frontier models for your team." });
    await user.notSee({ role: "button", label: "Subscribe" });
  });
  await step("provider Default is explicit and editing it preserves the draft and model", async () => {
    await user.see({ testId: "current-model-settings" });
    await user.click({ role: "button", label: "Default" });
    expect((await probe.dom('[data-testid="current-model-settings"] button[aria-pressed="true"]')).elements.map((element) => element.text)).toEqual(["Default"]);
    await user.click({ role: "button", label: "Done" });
    await user.see("composer", { text: draft });
    const current = await probe.composer();
    expect(current.selectedModelLabel).toBe(initial.selectedModelLabel);
  });
});
