import { interpret } from 'robot3';
const { create, freeze } = Object;

function valueEnumerable(value) {
  return { enumerable: true, value };
}

function createCurrent(service) {
  return freeze(create(service.machine.state, {
    context: valueEnumerable(service.context || {}),
    service: valueEnumerable(service)
  }));
}

export function createUseMachine(useEffect, useState) {
  return function useMachine(providedMachine) {
    let [machine, setMachine] = useState(providedMachine);
    let [service, setService] = useState(runInterpreter);

    function runInterpreter(arg) {
      let m = arg || machine;
      return interpret(m, service => {
        setCurrent(createCurrent(service.child || service));
      });
    }

    let [current, setCurrent] = useState(createCurrent(service));

    useEffect(() => {
      if(machine !== providedMachine) {
        setMachine(providedMachine);

        let newService = runInterpreter(providedMachine);
        setService(newService);
        setCurrent(createCurrent(newService));
      }
    }, [providedMachine]);

    return [current, service.send, service];
  };
}

