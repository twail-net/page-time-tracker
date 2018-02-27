import PageTime from '../index';

console.log('Setting up...');

PageTime.doAfter(3000, t => console.log(`${t} milis have passed`));
PageTime.doAfter(10000, t => console.log(`${t} milis have passed`));

PageTime.onUnload(t => alert(`unload after ${t} milis`))

console.log('Ok, start...');
PageTime.measure();
