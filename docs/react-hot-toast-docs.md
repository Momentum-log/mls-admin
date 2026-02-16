### Install React Hot Toast with pnpm

Source: https://react-hot-toast.com/docs/index

Installs the react-hot-toast library into your project using the pnpm package manager. This is a common first step before integrating notifications into your React application.

```bash
pnpm add react-hot-toast
```

---

### Basic React Hot Toast Usage Example

Source: https://react-hot-toast.com/docs/index

Demonstrates the fundamental usage of react-hot-toast. It shows how to import the necessary components, define a function to trigger a toast, and render the `Toaster` component to display notifications within a React application.

```javascript
import toast, { Toaster } from "react-hot-toast";

const notify = () => toast("Here is your toast.");

const App = () => {
  return (
    <div>
      <button onClick={notify}>Make me a toast</button>
      <Toaster />
    </div>
  );
};
```

---

### Install React Hot Toast with npm

Source: https://react-hot-toast.com/docs/index

Installs the react-hot-toast library into your project using the npm package manager. This command is an alternative to pnpm for adding the notification library to your React application.

```bash
npm install react-hot-toast
```

---

### Basic Toast Notification Implementation (React)

Source: https://react-hot-toast.com/docs/use-toaster

A fundamental example of implementing the `useToaster` hook for displaying basic toast notifications. It shows how to render visible toasts and attach event handlers for pausing/resuming timers on hover. Toasts are created using the imported `toast` function.

```javascript
import toast, { useToaster } from "react-hot-toast/headless";

const Notifications = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  return (
    <div onMouseEnter={startPause} onMouseLeave={endPause}>
      {toasts
        .filter((toast) => toast.visible)
        .map((toast) => (
          <div key={toast.id} {...toast.ariaProps}>
            {toast.message}
          </div>
        ))}
    </div>
  );
};

// Create toasts from anywhere
tost("Hello World");
```

---

### Animated Toast Notification Implementation (React)

Source: https://react-hot-toast.com/docs/use-toaster

Provides an example of implementing animated toast notifications using `useToaster`. This approach utilizes all toasts, including hidden ones, to manage smooth entry and exit animations. It demonstrates calculating offsets for positioning and updating toast heights for accurate layout.

```javascript
import { useToaster } from "react-hot-toast/headless";

const AnimatedNotifications = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
      }}
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {toasts.map((toast) => {
        const offset = calculateOffset(toast, {
          reverseOrder: false,
          gutter: 8,
        });

        const ref = (el) => {
          if (el && typeof toast.height !== "number") {
            const height = el.getBoundingClientRect().height;
            updateHeight(toast.id, height);
          }
        };

        return (
          <div
            key={toast.id}
            ref={ref}
            style={{
              position: "absolute",
              width: "200px",
              background: "papayawhip",
              transition: "all 0.5s ease-out",
              opacity: toast.visible ? 1 : 0,
              transform: `translateY(${offset}px)`,
            }}
            {...toast.ariaProps}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
};
```

---

### Implement Custom Enter and Exit Animations in React

Source: https://react-hot-toast.com/docs/styling

Create custom enter and exit animations for toasts by providing a render function to `Toaster` and overwriting the animation style in `ToastBar`. This allows for complex transitions based on the toast's visibility state. Ensure CSS animations are defined elsewhere.

```jsx
import { Toaster, ToastBar } from "react-hot-toast";

<Toaster>
  {(t) => (
    <ToastBar
      toast={t}
      style={{
        ...t.style,
        animation: t.visible
          ? "custom-enter 1s ease"
          : "custom-exit 1s ease forwards",
      }}
    />
  )}
</Toaster>;
```

---

### Style Individual Toasts Manually in React

Source: https://react-hot-toast.com/docs/styling

Apply custom styles to a single toast notification by passing a `style` object directly to the `toast()` function. This provides granular control over the appearance of specific alerts. This method is ideal for one-off styling requirements.

```jsx
toast("I have a border.", {
  style: {
    border: "1px solid black",
  },
});
```

---

### Custom Toast Rendering with resolveValue

Source: https://react-hot-toast.com/docs/toaster

This example shows how to implement a custom toast rendering function by passing children to the `<Toaster />` component. The `resolveValue` function is used to correctly display different message types (text, JSX, or functions) within the custom toast UI.

```javascript
import { Toaster, resolveValue } from "react-hot-toast";

// In your app
<Toaster>
  {(t) => (
    <div
      style={{ opacity: t.visible ? 1 : 0, background: "white", padding: 8 }}
    >
      {resolveValue(t.message, t)}
    </div>
  )}
</Toaster>;
```

---

### Change Icon Theme Colors in React

Source: https://react-hot-toast.com/docs/styling

Customize the colors of toast icons using the `iconTheme` object within `toastOptions`. Specify `primary` and `secondary` colors to match your application's theme. This applies to specific toast types if configured.

```jsx
<Toaster
  toastOptions={{
    success: {
      iconTheme: {
        primary: "green",
        secondary: "black",
      },
    },
  }}
/>
```

---

### Change Offset Between Toasts in React

Source: https://react-hot-toast.com/docs/styling

Control the vertical spacing between multiple toast notifications by adjusting the `gutter` prop on the `Toaster` component. A larger gutter value increases the distance between toasts. This enhances readability when multiple messages are displayed.

```jsx
<Toaster gutter={24} />
```

---

### React Hot Toast: Render JSX Custom Content

Source: https://react-hot-toast.com/docs/toast

This code snippet shows how to render custom JSX content within a React Hot Toast notification. It uses the `toast()` function and provides a React component as the content. The example includes an icon and demonstrates how to customize the appearance of the toast message.

```jsx
toast(
  <span>
    Custom and <b>bold</b>
  </span>,
  {
    icon: <Icon />,
  },
);
```

---

### Set Default Global Toast Styles in React

Source: https://react-hot-toast.com/docs/styling

Configure default styling for all notifications using `toastOptions` within the `Toaster` component. This affects properties like border, padding, and text color globally. Ensure the `Toaster` component is correctly placed in your React application.

```jsx
<Toaster
  toastOptions={{
    className: "",
    style: {
      border: "1px solid #713200",
      padding: "16px",
      color: "#713200",
    },
  }}
/>
```

---

### Change Toaster Container Offset in React

Source: https://react-hot-toast.com/docs/styling

Adjust the positioning offset of the `Toaster` component on the screen by modifying the `containerStyle` prop. This allows you to control the absolute position (top, left, bottom, right) of the notification container. Ensure these values are appropriate for your layout.

```jsx
<Toaster
  containerStyle={{
    top: 20,
    left: 20,
    bottom: 20,
    right: 20,
  }}
/>
```

---

### Set Default Specific Toast Type Styles in React

Source: https://react-hot-toast.com/docs/styling

Apply default styles to specific toast types (e.g., success, error) using `toastOptions` in the `Toaster` component. This allows for distinct visual treatments for different notification categories. This method is useful for visually differentiating toast statuses.

```jsx
<Toaster
  toastOptions={{
    success: {
      style: {
        background: "green",
      },
    },
    error: {
      style: {
        background: "red",
      },
    },
  }}
/>
```

---

### Change Toaster Container Position in React

Source: https://react-hot-toast.com/docs/styling

Modify the positioning behavior of the `Toaster` component by overriding the default `position: fixed` using the `containerStyle` prop. This enables you to place the toaster relative to other elements or within specific layout containers. Consider the implications for responsiveness.

```jsx
<Toaster
  containerStyle={{
    position: "relative",
  }}
/>
```

---

### useToaster API Parameters and Return Value (React)

Source: https://react-hot-toast.com/docs/use-toaster

Details the parameters accepted by the `useToaster` hook, including optional `toastOptions` for default toast settings and `toasterId` for unique instances. It also outlines the returned `toasts` array and `handlers` object for controlling toast behavior.

```javascript
useToaster(
  toastOptions?: DefaultToastOptions,
  toasterId?: string
)

// Returns:
{
  toasts: Toast[];
  handlers: {
    startPause: () => void;
    endPause: () => void;
    updateHeight: (toastId: string, height: number) => void;
    calculateOffset: (toast: Toast, options?: OffsetOptions) => number;
  };
}
```

---

### Multiple Toaster Instances (React)

Source: https://react-hot-toast.com/docs/use-toaster

Illustrates how to create and manage multiple independent toaster instances using the `toasterId` parameter. This allows for distinct notification areas, such as a sidebar, within the application. Toasts can then be targeted to specific instances using their `toasterId`.

```javascript
const sidebar = useToaster({ duration: 5000 }, "sidebar");
tost("Sidebar notification", { toasterId: "sidebar" });
```

---

### Import useToaster Hook (React)

Source: https://react-hot-toast.com/docs/use-toaster

Demonstrates how to import the `useToaster` hook from the `react-hot-toast` library. This hook is essential for managing toast notifications within your React application. It can be imported directly or from the headless entry point to exclude UI components.

```javascript
import { useToaster } from "react-hot-toast";
import { useToaster } from "react-hot-toast/headless";
```

---

### Create Toast with Options | JavaScript

Source: https://react-hot-toast.com/docs/toast

Demonstrates how to create a toast notification with various customization options. Options like duration, position, styling, custom icons, and ARIA properties can be passed as the second argument to override global toaster settings.

```javascript
toast("Hello World", {
  duration: 4000,
  position: "top-center",

  // Styling
  style: {},
  className: "",

  // Custom Icon
  icon: "👏",

  // Change colors of success/error/loading icon
  iconTheme: {
    primary: "#000",
    secondary: "#fff",
  },

  // Aria
  ariaProps: {
    role: "status",
    "aria-live": "polite",
  },

  // Additional Configuration
  removeDelay: 1000,

  // Toaster instance
  toasterId: "default",
});
```

---

### Create Loading Toast | JavaScript

Source: https://react-hot-toast.com/docs/toast

Shows how to display a loading toast, which is useful for indicating ongoing processes. It's common to update or dismiss this toast once the process is complete. For automatic handling, consider `toast.promise()`.

```javascript
toast.loading("Waiting...");
```

---

### Handle Promise with Toast | Simple Usage | JavaScript

Source: https://react-hot-toast.com/docs/toast

Demonstrates a convenient way to map a promise's lifecycle (pending, resolved, rejected) to toast notifications. The toast automatically updates based on the promise's outcome.

```javascript
const myPromise = fetchData();

test.promise(myPromise, {
  loading: "Loading",
  success: "Got the data",
  error: "Error when fetching",
});
```

---

### Configure Toaster Component with Options

Source: https://react-hot-toast.com/docs/toaster

This snippet demonstrates how to configure the main `<Toaster />` component with various options to control toast appearance, behavior, and default settings. It includes props like position, reverseOrder, gutter, and comprehensive toastOptions for different toast types.

```javascript
<Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerClassName=""
  containerStyle={{}}
  toasterId="default"
  toastOptions={{
    // Define default options
    className: "",
    duration: 5000,
    removeDelay: 1000,
    style: {
      background: "#363636",
      color: "#fff",
    },

    // Default options for specific types
    success: {
      duration: 3000,
      iconTheme: {
        primary: "green",
        secondary: "black",
      },
    },
  }}
/>
```

---

### Create Success Toast | JavaScript

Source: https://react-hot-toast.com/docs/toast

Illustrates how to create a success notification, which includes an animated checkmark icon. The appearance can be further customized using the `iconTheme` option.

```javascript
toast.success("Successfully created!");
```

---

### Custom Toast Rendering with `children`

Source: https://react-hot-toast.com/docs/toaster

Demonstrates how to use the `children` prop of the Toaster component to provide a custom render function for toasts, allowing full control over toast appearance and behavior.

````APIDOC
## Custom Toast Rendering with `children`

### Description

The `<Toaster />` component accepts a `children` prop which can be a function. This function is called for each toast and receives the toast object (`t`) as an argument. It allows you to completely customize how each toast is rendered, using the `resolveValue` utility to handle different message types.

### Method

N/A (Component API)

### Endpoint

N/A (Component API)

### Parameters

#### `children` (function)

- **`t`** (object) - The current toast object. Contains properties like `visible`, `message`, `id`, `style`, etc.

#### `resolveValue` Utility

- **`resolveValue(message, toast)`** (function) - A helper function to correctly render the toast message, whether it's a string, JSX, or a function that returns JSX.

### Request Example (Custom Renderer)

```jsx
import { Toaster, resolveValue } from 'react-hot-toast';

<Toaster>
  {(t) => (
    <div
      style={{ opacity: t.visible ? 1 : 0, background: 'white', padding: 8 }}
    >
      {resolveValue(t.message, t)}
    </div>
  )}
</Toaster>;
````

### Request Example (Adapting `ToastBar`)

```jsx
import { Toaster, ToastBar } from "react-hot-toast";

<Toaster>
  {(t) => (
    <ToastBar
      toast={t}
      style={{
        ...t.style,
        animation: t.visible
          ? "custom-enter 1s ease"
          : "custom-exit 1s ease forwards",
      }}
    />
  )}
</Toaster>;
```

### Response

N/A (Component API)

### Response Example

N/A (Component API)

````

--------------------------------

### Customizing ToastBar Styles and Position

Source: https://react-hot-toast.com/docs/toast-bar

Demonstrates how to use the ToastBar component with custom styles and position. The `style` prop allows overwriting default CSS, and `position` influences the animation. The `toast` prop is required to pass toast data.

```jsx
<ToastBar
  toast={t}
  style={{}}
  position="top-center"
/>
````

---

### Create Error Toast | JavaScript

Source: https://react-hot-toast.com/docs/toast

Demonstrates creating an error notification, characterized by an animated error icon. The `iconTheme` option can be used to theme this icon.

```javascript
toast.error("This is an error!");
```

---

### Handle Promise with Toast | Async Function | JavaScript

Source: https://react-hot-toast.com/docs/toast

Shows how to use `toast.promise()` with an async function that returns a promise. This function will be invoked automatically, and its resolution or rejection will trigger corresponding toast updates.

```javascript
toast.promise(
  async () => {
    const { id } = await fetchData1();
    await fetchData2(id);
  },
  {
    loading: "Loading",
    success: "Got the data",
    error: "Error when fetching",
  },
);
```

---

### Create Blank Toast | JavaScript

Source: https://react-hot-toast.com/docs/toast

Shows the most basic way to create a toast notification with just a message. This variant does not have an icon by default but can be customized using the options argument.

```javascript
toast("Hello World");
```

---

### Adapt Default ToastBar with Custom Animation

Source: https://react-hot-toast.com/docs/toaster

This snippet demonstrates how to customize the default `<ToastBar />` component by providing it as a child to `<Toaster />`. It shows how to dynamically apply different CSS animations for toast entry and exit based on the toast's visibility state.

```javascript
import { Toaster, ToastBar } from "react-hot-toast";

<Toaster>
  {(t) => (
    <ToastBar
      toast={t}
      style={{
        ...t.style,
        animation: t.visible
          ? "custom-enter 1s ease"
          : "custom-exit 1s ease forwards",
      }}
    />
  )}
</Toaster>;
```

---

### Create Custom Toast with JSX | JavaScript

Source: https://react-hot-toast.com/docs/toast

Explains how to render a custom toast notification using JSX. This method bypasses default styles, allowing for complete control over the toast's appearance.

```javascript
toast.custom(<div>Hello World</div>);
```

---

### Handle Promise with Toast | Advanced Usage | JavaScript

Source: https://react-hot-toast.com/docs/toast

Provides an advanced method for handling promises with toasts, allowing custom messages based on the promise result or error. It also supports configuring toast options specifically for success or error states.

```javascript
toast.promise(
  myPromise,
  {
    loading: "Loading",
    success: (data) => `Successfully saved ${data.name}`,
    error: (err) => `This just happened: ${err.toString()}`,
  },
  {
    style: {
      minWidth: "250px",
    },
    success: {
      duration: 5000,
      icon: "🔥",
    },
  },
);
```

---

### Adding Custom Content and Dismiss Button to ToastBar

Source: https://react-hot-toast.com/docs/toast-bar

Shows how to customize the content of a ToastBar using a render function. The function receives `icon` and `message` props, allowing for modifications. A dismiss button is conditionally added, excluding 'loading' toasts, by utilizing the `toast.dismiss` function.

```jsx
import { toast, Toaster, ToastBar } from "react-hot-toast";

<Toaster>
  {(t) => (
    <ToastBar toast={t}>
      {({ icon, message }) => (
        <>
          {icon}
          {message}
          {t.type !== "loading" && (
            <button onClick={() => toast.dismiss(t.id)}>X</button>
          )}
        </>
      )}
    </ToastBar>
  )}
</Toaster>;
```

---

### Custom Toast Rendering with Toaster and ToastBar APIs

Source: https://react-hot-toast.com/docs/version-2

Utilize the Custom Renderer API with the `<Toaster />` component to render your own custom toast interfaces. The render function receives a `Toast` object, enabling dynamic rendering of toast content, animations, or custom dismiss buttons, similar to using `useToaster()`.

```javascript
import { toast, Toaster, ToastBar } from "react-hot-toast";

const CustomToaster = () => (
  <Toaster>
    {(t) => (
      <ToastBar toast={t}>
        {({ icon, message }) => (
          <>
            {icon}
            {message}
            {t.type !== "loading" && (
              <button onClick={() => toast.dismiss(t.id)}>X</button>
            )}
          </>
        )}
      </ToastBar>
    )}
  </Toaster>
);
```

---

### Add Multiple Toasters with Unique IDs in React

Source: https://react-hot-toast.com/docs/multi-toaster

Demonstrates how to render multiple `<Toaster />` components, each with a distinct `toasterId`, to manage separate notification queues and configurations within a React application.

```jsx
<Toaster toasterId="sidebar" />
```

```jsx
// Create a toaster with a unique id
<Toaster toasterId="area1" />


// Create another toaster with a unique id
<Toaster toasterId="area2" toastOptions={{ ... }} />
```

---

### <Toaster /> Component API

Source: https://react-hot-toast.com/docs/toaster

The Toaster component renders all toasts. It accepts various props to control its appearance, behavior, and default toast options.

````APIDOC
## <Toaster /> Component API

### Description

The `<Toaster />` component is responsible for rendering all toast notifications in the application. It provides a centralized way to manage and display toasts, with extensive customization options.

### Method

N/A (Component API)

### Endpoint

N/A (Component API)

### Parameters

#### Props

- **`position`** (string) - Optional - Specifies the position of the toasts on the screen. Available options: `"top-left"`, `"top-center"`, `"top-right"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"`. Defaults to `"top-center"`.
- **`reverseOrder`** (boolean) - Optional - If `true`, new toasts will appear at the bottom instead of the top. Defaults to `false`.
- **`gutter`** (number) - Optional - The gap in pixels between each toast. Defaults to `8`.
- **`containerClassName`** (string) - Optional - A custom CSS class name to apply to the main toaster container element.
- **`containerStyle`** (object) - Optional - Inline styles to apply to the main toaster container element, useful for adjusting offset.
- **`toasterId`** (string) - Optional - A unique identifier for the toaster instance. Useful when using multiple toasters. Defaults to `"default"`.
- **`toastOptions`** (object) - Optional - Default options that will be applied to all toasts rendered by this toaster. This can include properties like `className`, `duration`, `removeDelay`, `style`, and type-specific options (`success`, `error`, `loading`, `custom`).

#### `toastOptions` Structure

- **`className`** (string) - Optional - Default CSS class for individual toasts.
- **`duration`** (number) - Optional - Default duration in milliseconds before a toast disappears.
- **`removeDelay`** (number) - Optional - Default delay in milliseconds before a toast is removed from the DOM after expiration.
- **`style`** (object) - Optional - Default inline styles for individual toasts.
- **`success`** (object) - Optional - Default options specifically for success toasts.
- **`error`** (object) - Optional - Default options specifically for error toasts.
- **`loading`** (object) - Optional - Default options specifically for loading toasts.
- **`custom`** (object) - Optional - Default options specifically for custom toasts.

### Request Example (Component Usage)

```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div>
      {/* Your app content */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          className: '',
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
````

### Response

N/A (Component API)

### Response Example

N/A (Component API)

````

--------------------------------

### Position a Specific Toaster in a Relative Parent Container in React

Source: https://react-hot-toast.com/docs/multi-toaster

Illustrates how to position a specific toaster instance absolutely within a relatively positioned parent container. This allows for precise placement of notification areas in the UI.

```jsx
<div style={{ position: 'relative' }}>
  <Toaster
    toasterId="area1"
    position="top-center"
    containerStyle={{ position: 'absolute' }}
  />
</div>
````

---

### Dismiss All Toasts Programmatically | JavaScript

Source: https://react-hot-toast.com/docs/toast

Demonstrates dismissing all currently active toast notifications simultaneously by calling `toast.dismiss()` without any arguments.

```javascript
toast.dismiss();
```

---

### Render Custom Components with toast.custom() in React

Source: https://react-hot-toast.com/docs/version-2

Use the toast.custom() function to render any React component as a toast. This provides complete control over styling as no default styles are applied. It accepts JSX directly or a function that returns JSX, allowing access to toast state for animations.

```javascript
import { toast } from 'react-hot-toast';

// Minimal Example
t oast.custom(<div>Minimal Example</div>);

// Tailwind Example
t oast.custom((t) => (
  <div
    className={`bg-white px-6 py-4 shadow-md rounded-full ${t.visible ? 'animate-custom-enter' : 'animate-custom-leave'}`}
  >
    Hello TailwindCSS! 👋
  </div>
));
```

---

### React Hot Toast: Render Custom Content with Dismiss Button

Source: https://react-hot-toast.com/docs/toast

This code snippet demonstrates how to render custom content, including a dismiss button, within a React Hot Toast notification. It uses a function that receives the `Toast` object as an argument, allowing access to properties like the toast ID. This enables the creation of a dismiss button that closes the specific toast.

```jsx
toast(
  (t) => (
    <span>
      Custom and <b>bold</b>
      <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
    </span>
  ),
  {
    icon: <Icon />,
  },
);
```

---

### Create Toasts for Specific Toasters using toasterId in React

Source: https://react-hot-toast.com/docs/multi-toaster

Shows how to direct notifications to a particular toaster instance by passing the `toasterId` option to the `toast` function. If `toasterId` is omitted, the toast defaults to the 'default' toaster.

```javascript
// Create a toast in area 1
t oast('Notification for Area 1', {
  toasterId: 'area1',
});
```

---

### Configure Toast Remove Delay | JavaScript

Source: https://react-hot-toast.com/docs/toast

Shows how to configure the delay before a toast is removed after being dismissed, allowing for exit animations. This can be set per toast or globally via the `<Toaster />` component.

```javascript
toast.success("Successfully created!", { removeDelay: 500 });
```

```jsx
<Toaster
  toastOptions={{
    removeDelay: 500,
  }}
/>
```

---

### Per-Toast Positioning in React Hot Toast

Source: https://react-hot-toast.com/docs/version-2

Control the exact position of individual toasts by specifying the 'position' option when dispatching a toast. This allows for multiple toasts to be displayed in different locations simultaneously.

```javascript
import { toast } from 'react-hot-toast';

t oast.success('Always at the bottom', {
  position: 'bottom-center',
});
```

---

### Adjusting Gutter Between Toasts with Toaster Component

Source: https://react-hot-toast.com/docs/version-2

Control the spacing between stacked toasts using the `gutter` prop on the `<Toaster />` component. This prop accepts a number representing the desired gap in pixels.

```javascript
import { Toaster } from "react-hot-toast";

<Toaster gutter={30} />;
```

---

### Update Existing Toast | JavaScript

Source: https://react-hot-toast.com/docs/toast

Demonstrates how to update the content or options of an existing toast notification using its unique ID. This is useful for scenarios like changing a loading message to a success message.

```javascript
const toastId = toast.loading("Loading...");

// ...

test.success("This worked", {
  id: toastId,
});
```

---

### Prevent Duplicate Toasts | JavaScript

Source: https://react-hot-toast.com/docs/toast

Shows how to prevent duplicate toasts of the same kind by assigning a unique, permanent ID. If a toast with the same ID already exists, it will be updated instead of a new one being created.

```javascript
toast.success("Copied to clipboard!", {
  id: "clipboard",
});
```

---

### Customizing Toaster Container Position in React

Source: https://react-hot-toast.com/docs/version-2

Overwrite the default position of the entire toaster container using the `containerStyle` prop on the `<Toaster />` component. This allows you to place the toaster at any desired location on the screen.

```javascript
import { Toaster } from "react-hot-toast";

<Toaster containerStyle={{ position: "absolute" }} />;
```

---

### Dismiss Single Toast Programmatically | JavaScript

Source: https://react-hot-toast.com/docs/toast

Illustrates how to dismiss a specific toast notification using its unique ID. This action triggers the toast's exit animation before removal.

```javascript
const toastId = toast.loading("Loading...");

// ...

test.dismiss(toastId);
```

---

### Remove Toasts Instantly | JavaScript

Source: https://react-hot-toast.com/docs/toast

Explains how to remove toast notifications instantly without any exit animations. This can be done for a specific toast using its ID or for all toasts.

```javascript
toast.remove(toastId);

// or

test.remove();
```

---

### Customizing Toaster Offset Styles

Source: https://react-hot-toast.com/docs/version-2

Modify the offset of the toaster container by setting `top`, `right`, `bottom`, or `left` styles within the `containerStyle` prop of the `<Toaster />` component. This replaces the older margin-based offset control.

```javascript
import { Toaster } from "react-hot-toast";

<Toaster containerStyle={{ top: "8px" }} />;
```

=== COMPLETE CONTENT === This response contains all available snippets from this library. No additional content exists. Do not make further requests.
