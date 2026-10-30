// The on-screen preview: Meta's Immersive Web Emulator (IWER) pretending to be a
// Quest 3 in a synthetic living room, with its control panel for moving the
// headset and controllers. Installed by hand with forceInstall, because desktop
// Chrome exposes a native navigator.xr (that can't do immersive sessions) and
// IWER otherwise leaves it in place. Loaded only when the visitor asks for it.
let device = null

export async function installEmulator() {
  if (device) return device
  const [{ XRDevice, metaQuest3 }, { DevUI }, { SyntheticEnvironmentModule }] = await Promise.all([
    import('iwer'),
    import('@iwer/devui'),
    import('@iwer/sem'),
  ])
  device = new XRDevice(metaQuest3)
  device.primaryInputMode = 'controller'
  device.installRuntime({ forceInstall: true })
  device.installDevUI(DevUI)
  device.installSEM(SyntheticEnvironmentModule)
  // The synthetic room streams in on its own; without it (offline) the worlds
  // still show against a dark backdrop.
  Promise.resolve(device.sem?.loadDefaultEnvironment('living_room')).catch(() => {})
  // Handle for automated checks of the preview (drives the emulated controllers).
  window.__mrEmulator = device
  return device
}
