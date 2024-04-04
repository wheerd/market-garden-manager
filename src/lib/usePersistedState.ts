import {useState, useEffect, useCallback} from 'react';
import {set, get} from 'idb-keyval';

export function usePersistedState<TState>(
  keyToPersistWith: string,
  defaultState: TState
) {
  const [state, setState] = useState<TState | undefined>(undefined);

  useEffect(() => {
    get<TState>(keyToPersistWith).then(
      retrievedState =>
        setState(
          typeof retrievedState === 'undefined' ? defaultState : retrievedState
        ),
      (e: unknown) => console.error(e)
    );
  }, [keyToPersistWith, defaultState]);

  const setPersistedValue = useCallback(
    (newValue: TState) => {
      setState(newValue);
      set(keyToPersistWith, newValue).catch((e: unknown) => console.error(e));
    },
    [keyToPersistWith]
  );

  return [state, setPersistedValue] as const;
}
