import {useState, useEffect, useCallback} from 'react';
import {set, get} from 'idb-keyval';

export function usePersistedState<TState>(
  keyToPersistWith: string,
  defaultState: TState
) {
  const [state, setState] = useState<TState | undefined>(undefined);

  useEffect(() => {
    get<TState>(keyToPersistWith).then(
      retrievedState => {
        setState(
          typeof retrievedState === 'undefined' ? defaultState : retrievedState
        );
      },
      (e: unknown) => {
        console.error(e);
      }
    );
  }, [keyToPersistWith, setState, defaultState]);

  const setPersistedValue = useCallback(
    (newValue: TState) => {
      set(keyToPersistWith, newValue).then(
        () => {
          setState(newValue);
        },
        (e: unknown) => {
          console.error(e);
        }
      );
    },
    [keyToPersistWith, setState]
  );

  return [state, setPersistedValue] as const;
}
