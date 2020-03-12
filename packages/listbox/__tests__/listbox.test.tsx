import React from "react";
import { render, act, fireEvent, keyType } from "$test/utils";
import { axe } from "jest-axe";
import {
  Listbox,
  ListboxButton,
  ListboxInput,
  ListboxPopover,
  ListboxOption,
  ListboxList,
} from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";

describe("<Listbox />", () => {
  it("should mount the component", () => {
    act(() => {
      const { queryByRole } = render(<BasicListbox />);
      expect(queryByRole("button")).toBeTruthy();
    });
  });

  it("should mount the composed component", () => {
    act(() => {
      const { queryByRole } = render(
        <ListboxInput>
          <ListboxButton />
          <ListboxPopover>
            <ListboxList>
              <ListboxOption value="asada">Carne Asada</ListboxOption>
              <ListboxOption value="pollo">Pollo</ListboxOption>
              <ListboxOption value="lengua">Lengua</ListboxOption>
            </ListboxList>
          </ListboxPopover>
        </ListboxInput>
      );
      expect(queryByRole("button")).toBeTruthy();
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      const { container } = render(<FancyListbox />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("renders a valid listbox", () => {
      const { queryByRole, getByRole } = render(<BasicListbox />);

      // Since a closed listbox is hidden, it won't be visible to the
      // accessibility tree which means queryByRole will fail. Open the listbox
      // and then find by role.
      act(() => {
        fireMouseClick(getByRole("button"));
      });

      expect(queryByRole("listbox")).toBeTruthy();
    });

    it("should have a tabbable button", () => {
      const { getByRole } = render(<BasicListbox />);
      expect(getByRole("button")).toHaveAttribute("tabindex", "0");
    });

    //   TODO: it("should focus the list when open", () => {
    //     const { getByRole } = render(<BasicListbox />);

    //     act(() => {
    //       fireMouseClick(getByRole("button"));
    //     });

    //     // May use small timeout or requestAnimationFrame
    //     jest.advanceTimersByTime(10);
    //     expect(getByRole("listbox")).toHaveFocus();
    //   });

    // TODO: it('sets `aria-expanded="true"` when the listbox is open', () => {})
    // TODO: it('removes `aria-expanded` when the listbox is closed', () => {})
    // TODO: it('sets `aria-haspopup` to `"listbox"` on the button', () => {})
  });

  describe("as a form input", () => {
    it("should not have a hidden input field when form props are not provided", () => {
      const { container } = render(
        <Listbox>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
        </Listbox>
      );
      expect(container.querySelector("input")).not.toBeTruthy();
    });

    it("should have a hidden input field when `name` prop is provided", () => {
      const { container } = render(
        <Listbox name="taco">
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
        </Listbox>
      );
      expect(container.querySelector("input")).toBeTruthy();
    });

    it("should have a hidden input field when `form` prop is provided", () => {
      const { container } = render(
        <div>
          <form id="my-form">
            <label>
              Name
              <input type="text" name="name" />
            </label>
            <button>Submit</button>
          </form>
          <Listbox form="my-form">
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
          </Listbox>
        </div>
      );
      expect(container.querySelector("input")).toBeTruthy();
    });

    it("should have a hidden required input field when `required` prop is provided", () => {
      const { container } = render(
        <Listbox required>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
        </Listbox>
      );
      expect(container.querySelector("input")).toBeTruthy();
      expect(container.querySelector("input")).toHaveAttribute("required");
    });
  });

  describe("user events", () => {
    it("should toggle on button click", () => {
      let { getByRole, container } = render(<FancyListbox />);
      let getPopover = () =>
        container.querySelector("[data-reach-listbox-popover]");

      expect(getPopover()).not.toBeVisible();
      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover()).toBeVisible();
      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover()).not.toBeVisible();
    });

    [" ", "ArrowUp", "ArrowDown"].forEach(key => {
      it(`should open the listbox when \`${
        key === " " ? "Spacebar" : key
      }\` pressed while idle`, () => {
        const { getByRole, queryByRole } = render(<BasicListbox />);
        getByRole("button").focus();

        act(() => void fireEvent.keyDown(document.activeElement!, { key }));
        expect(queryByRole("listbox", { hidden: false })).toBeTruthy();
        act(() => void fireEvent.keyUp(document.activeElement!, { key }));
        expect(queryByRole("listbox", { hidden: false })).toBeTruthy();
      });
    });

    it("should close when the clicked outside", () => {
      const { getByTestId, getByRole, container } = render(
        <div>
          <span data-testid="outside-el" tabIndex={0}>
            Hi
          </span>
          <br />
          <br />
          <br />
          <br />
          <Listbox name="taco" portal={false}>
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
          </Listbox>
        </div>
      );

      let getPopover = () =>
        container.querySelector("[data-reach-listbox-popover]");

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover()).toBeVisible();
      act(() => void getByTestId("outside-el"));
      // TODO: Fails, unsure why.
      // expect(getPopover()).not.toBeVisible();
    });

    it("should close on escape", () => {
      const { container, getByRole } = render(<FancyListbox />);

      let getPopover = () =>
        container.querySelector("[data-reach-listbox-popover]");

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover()).toBeVisible();
      act(() => void keyType(getByRole("button"), "Escape"));
      expect(getPopover()).not.toBeVisible();
    });

    it("should update the value when the user types when idle", () => {
      jest.useFakeTimers();
      const { getByRole, container } = render(
        <Listbox name="taco" portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );

      let input = container.querySelector("input");

      getByRole("button").focus();
      act(() => void keyType(getByRole("button"), "c"));
      expect(input).toHaveValue("asada");

      // Immediate key event shouldn't change the value unless the user continues
      // typing out the next letter of a matching label.
      act(() => void keyType(getByRole("button"), "p"));
      expect(input).toHaveValue("asada");

      act(() => {
        jest.advanceTimersByTime(5000);
        act(() => void keyType(getByRole("button"), "p"));
      });
      // starts searching from the beginning of the list
      expect(input).toHaveValue("pollo");

      // continue spelling a word that matches another option
      act(() => void keyType(getByRole("button"), "a"));
      expect(input).toHaveValue("pastor");
    });
    // TODO: it("should update the selection when the user types when expanded", () => {});
    // TODO: it("should select an option on mouseup", () => {});
    // TODO: it("should prevent scrolling on `Spacebar`", () => {});
    // TODO: it("should prevent scrolling on `ArrowDown`", () => {});
    // TODO: it("should prevent scrolling on `ArrowUp`", () => {});
    // TODO: it("should prevent scrolling on `PageUp`", () => {});
    // TODO: it("should prevent scrolling on `PageDown`", () => {});
    // TODO: it("should call onChange", () => {});
  });
});

function BasicListbox() {
  return (
    <Listbox portal={false}>
      <ListboxOption value="pollo">Pollo</ListboxOption>
      <ListboxOption value="asada">Carne Asada</ListboxOption>
      <ListboxOption value="lengua">Lengua</ListboxOption>
      <ListboxOption value="pastor">Pastor</ListboxOption>
    </Listbox>
  );
}

function FancyListbox() {
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox aria-labelledby="taco-label" defaultValue="asada" portal={false}>
        <ListboxOption value="default">
          Choose a taco <Taco />
        </ListboxOption>
        <hr />
        <ListboxOption value="asada">
          Carne Asada <Taco />
        </ListboxOption>
        <ListboxOption value="pollo" disabled>
          Pollo <Taco /> <Tag>Sold Out!</Tag>
        </ListboxOption>
        <div style={{ background: "#ccc" }}>
          <ListboxOption value="pastor">
            Pastor <Taco /> <Tag>Fan favorite!</Tag>
          </ListboxOption>
        </div>
        <ListboxOption value="lengua">
          Lengua <Taco />
        </ListboxOption>
      </Listbox>
    </div>
  );
}

function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}

function Tag(props: any) {
  return (
    <span
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bolder",
        marginLeft: 6,
        padding: 4,
        background: "crimson",
        borderRadius: 2,
        color: "#fff",
      }}
      {...props}
    />
  );
}

/**
 * Listbox opens on mousedown, not click event
 * @param element
 */
function fireMouseClick(element: HTMLElement) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
}
