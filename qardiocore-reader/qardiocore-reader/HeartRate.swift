//
//  HeartRate.swift
//  Heart Control
//
//  Created by Thomas Paul Mann on 07/08/16.
//  Copyright © 2016 Thomas Paul Mann. All rights reserved.
//

import Foundation

struct HeartRate : Encodable {
    let type: Types
    let device: String
    let name: String
    let timestamp: Int
    let bpm: Double
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(type.rawValue, forKey: .type)
        try container.encode(device, forKey: .device)
        try container.encode(name, forKey: .name)
        try container.encode(timestamp, forKey: .timestamp)
        try container.encode(bpm, forKey: .bpm)
    }
    
    enum Types: String {
        case entry = "entry"
        case start = "start"
        case end = "end"
    }
    
    enum CodingKeys: String, CodingKey {
        case type = "type"
        case device = "device"
        case name = "name"
        case timestamp = "timestamp"
        case bpm = "bpm"
    }
}
