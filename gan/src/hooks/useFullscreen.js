import { useEffect, useState } from "react";
import screenfull from "screenfull";

const useFullscreen = () => {
  const [ isFullscreen, setFullscreen ] = useState(screenfull.isFullscreen);

  const isAvailable = screenfull.isEnabled;

  useEffect(() => {
    if(isAvailable === false)
      return;

    const change = () => setFullscreen(screenfull.isFullscreen);

    screenfull.on("change", change);

    return () => screenfull.off("change", change);
  }, []);

  const toggle = () => screenfull.toggle();
  const enter = () => screenfull.request();
  const exit = () => screenfull.exit();

  return { isAvailable, isFullscreen, toggle, enter, exit };
}

export default useFullscreen;
