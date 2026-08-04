import { IProtocolCopy } from "./copyProtocol";

/**
 * Router state handed to the editor when a protocol is copied.
 *
 * It travels through the navigation instead of the redux slice because the list
 * page resets that slice while unmounting, right after the copy is dispatched.
 */
export interface IProtocolEditorLocationState {
  protocolCopy?: IProtocolCopy;
}
